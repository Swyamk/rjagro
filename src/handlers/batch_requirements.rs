use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use entity::{
    batch_allocation_lines, batch_allocations, items, ledger_accounts, ledger_entries,
    sea_orm_active_enums::{ItemCategory, RequirementStatus},
    stock_receipts,
};
use entity::{
    batch_requirements, inventory, inventory_movements, sea_orm_active_enums::MovementType,
};
use sea_orm::ColumnTrait;
use sea_orm::{
    prelude::Decimal, ActiveModelTrait, DatabaseConnection, EntityTrait, QueryFilter, QueryOrder,
    Set,
};
use sea_orm::{DatabaseTransaction, IntoActiveModel, TransactionTrait};
use uuid::Uuid;

use crate::models::{ApprovePayload, ResponseMessage};

pub async fn decline_batch_requirement_handler(
    Path(requirement_id): Path<i32>,
    State(db): State<DatabaseConnection>,
) -> impl IntoResponse {
    // Fetch the requirement by primary key
    match batch_requirements::Entity::find_by_id(requirement_id)
        .one(&db)
        .await
    {
        Ok(Some(requirement)) => {
            let mut active_model = requirement.into_active_model();
            active_model.status = Set(RequirementStatus::Decline);

            match active_model.update(&db).await {
                Ok(_) => (
                    StatusCode::OK,
                    Json(ResponseMessage {
                        message: format!("Requirement {} declined successfully", requirement_id),
                    }),
                )
                    .into_response(),
                Err(e) => {
                    eprintln!("Failed to update requirement {}: {}", requirement_id, e);
                    StatusCode::INTERNAL_SERVER_ERROR.into_response()
                }
            }
        }
        Ok(None) => (
            StatusCode::NOT_FOUND,
            Json(ResponseMessage {
                message: format!("Requirement {} not found", requirement_id),
            }),
        )
            .into_response(),
        Err(e) => {
            eprintln!("Failed to fetch requirement {}: {}", requirement_id, e);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}

pub async fn approve_batch_requirement_handler(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<ApprovePayload>,
) -> impl IntoResponse {
    // Start transaction
    match db.begin().await {
        Ok(txn) => {
            let result = approve_and_allocate(payload.requirement_id, payload, &txn).await;

            match result {
                Ok(msg) => {
                    if let Err(e) = txn.commit().await {
                        eprintln!("Transaction commit failed: {}", e);
                        return StatusCode::INTERNAL_SERVER_ERROR.into_response();
                    }
                    (StatusCode::OK, Json(ResponseMessage { message: msg })).into_response()
                }
                Err(e) => {
                    eprintln!("Transaction failed: {}", e);
                    // rollback happens automatically when txn is dropped
                    StatusCode::INTERNAL_SERVER_ERROR.into_response()
                }
            }
        }
        Err(e) => {
            eprintln!("Failed to start transaction: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}

async fn approve_and_allocate(
    requirement_id: i32,
    payload: ApprovePayload,
    txn: &DatabaseTransaction,
) -> Result<String, String> {
    use sea_orm::ActiveValue::Set;

    // 1. Fetch requirement
    let requirement = batch_requirements::Entity::find_by_id(requirement_id)
        .one(txn)
        .await
        .map_err(|e| format!("DB fetch error: {}", e))?
        .ok_or_else(|| format!("Requirement {} not found", requirement_id))?;

    // 2. Update requirement status -> Accept
    let mut active_model = requirement.clone().into_active_model();
    active_model.status = Set(RequirementStatus::Accept);
    active_model
        .update(txn)
        .await
        .map_err(|e| format!("Failed to update requirement: {}", e))?;

    // 3. Insert allocation
    let allocation = batch_allocations::ActiveModel {
        allocation_id: Default::default(),
        requirement_id: Set(payload.requirement_id),
        allocated_qty: Set(payload.allocated_qty),
        allocation_date: Set(payload.allocation_date),
        allocated_value: Set(Decimal::ZERO), // to be updated after FIFO allocation
        allocated_by: Set(payload.allocated_by),
    };

    let allocation_model = allocation
        .insert(txn)
        .await
        .map_err(|e| format!("Failed to insert allocation: {}", e))?;

    // 4. Update inventory (deduct allocated qty)
    if let Some(inv) = inventory::Entity::find_by_id(requirement.item_code.clone())
        .one(txn)
        .await
        .map_err(|e| format!("Failed to fetch inventory: {}", e))?
    {
        let mut active_inv: inventory::ActiveModel = inv.into();
        let current = active_inv.current_qty.take().unwrap_or_default();

        if current < payload.allocated_qty {
            return Err(format!(
                "Not enough stock for item {}. Required: {}, Available: {}",
                requirement.item_code, payload.allocated_qty, current
            ));
        }

        active_inv.current_qty = Set(current - payload.allocated_qty);
        active_inv.last_updated = Set(chrono::Utc::now().into());

        active_inv
            .update(txn)
            .await
            .map_err(|e| format!("Failed to update inventory: {}", e))?;
    } else {
        return Err(format!(
            "No inventory record found for item {}",
            requirement.item_code
        ));
    }

    // 5. Insert inventory movement (OUT)
    let movement = inventory_movements::ActiveModel {
        movement_id: Default::default(),
        item_code: Set(requirement.item_code.clone()),
        movement_type: Set(MovementType::Allocation),
        qty_change: Set(-payload.allocated_qty),
        reference_id: Set(Some(allocation_model.allocation_id)),
        ..Default::default()
    };

    movement
        .insert(txn)
        .await
        .map_err(|e| format!("Failed to insert inventory movement: {}", e))?;

    // -----------------------------------------------------------
    // 6. FIFO allocation from stock_receipts -> batch_allocation_lines
    // -----------------------------------------------------------
    let mut qty_to_allocate = payload.allocated_qty;
    let mut total_value = Decimal::ZERO;

    // fetch lots in FIFO order
    let receipts = stock_receipts::Entity::find()
        .filter(stock_receipts::Column::ItemCode.eq(requirement.item_code.clone()))
        .filter(stock_receipts::Column::RemainingQty.gt(Decimal::ZERO))
        .order_by_asc(stock_receipts::Column::ReceivedDate)
        .order_by_asc(stock_receipts::Column::LotId)
        .all(txn)
        .await
        .map_err(|e| format!("Failed to fetch stock receipts: {}", e))?;

    for r in receipts {
        if qty_to_allocate <= Decimal::ZERO {
            break;
        }

        let take = std::cmp::min(r.remaining_qty, qty_to_allocate);
        let line_value = take * r.unit_cost;

        // insert allocation line
        let line = batch_allocation_lines::ActiveModel {
            allocation_line_id: Default::default(),
            allocation_id: Set(allocation_model.allocation_id),
            lot_id: Set(r.lot_id),
            qty: Set(take),
            unit_cost: Set(r.unit_cost),
            line_value: Set(line_value),
        };
        line.insert(txn)
            .await
            .map_err(|e| format!("Failed to insert allocation line: {}", e))?;

        // update lot remaining qty
        let mut r_active: stock_receipts::ActiveModel = r.into();
        r_active.remaining_qty = Set(r_active.remaining_qty.take().unwrap() - take);
        r_active
            .update(txn)
            .await
            .map_err(|e| format!("Failed to update stock_receipt: {}", e))?;

        total_value += line_value;
        qty_to_allocate -= take;
    }

    // update allocation with monetary worth
    let mut alloc_update: batch_allocations::ActiveModel = allocation_model.clone().into();
    alloc_update.allocated_value = Set(total_value);
    alloc_update
        .update(txn)
        .await
        .map_err(|e| format!("Failed to update allocation value: {}", e))?;

    if qty_to_allocate > Decimal::ZERO {
        // not enough stock: business decision → error, negative stock, or backorder
        return Err(format!(
            "Partial allocation: shortage of {} units for item {}",
            qty_to_allocate, requirement.item_code
        ));
    }

    let item = items::Entity::find_by_id(requirement.item_code.clone())
        .one(txn)
        .await
        .map_err(|e| {
            tracing::error!("Failed to fetch item {}: {}", requirement.item_code, e);
            format!("Failed to fetch item: {}", e)
        })?
        .ok_or_else(|| {
            tracing::error!("Item {} not found", requirement.item_code);
            format!("Item {} not found", requirement.item_code)
        })?;

    let (asset_account_id, expense_account_id) = match item.item_category {
        ItemCategory::Medicine => (102_i32, 107_i32), // inventory-medicine -> farm-expense
        ItemCategory::Feed => (103_i32, 107_i32),     // inventory-feed -> farm-expense
        ItemCategory::Chicks => (104_i32, 107_i32),   // inventory-chicks -> farm-expense
    };

    let txn_group_id = Uuid::new_v4();

    let credit_entry = ledger_entries::ActiveModel {
        entry_id: Default::default(),
        account_id: Set(asset_account_id),
        debit: Set(None),
        credit: Set(Some(total_value)),
        txn_date: Set(chrono::Utc::now().date_naive()),
        reference_table: Set(Some("allocations".into())),
        narration: Set(Some(format!(
            "approve of (requirement {})",
            payload.requirement_id
        ))),
        txn_group_id: Set(txn_group_id),
        reference_id: Set(Some(allocation_model.allocation_id)),
        created_by: Set(Some(payload.allocated_by)),
        created_at: Set(chrono::Utc::now().into()),
        ..Default::default()
    };

    credit_entry.insert(txn).await.map_err(|e| {
        tracing::error!("Failed to insert credit entry: {}", e);
        format!("Failed to insert credit entry: {}", e)
    })?;

    let debit_entry = ledger_entries::ActiveModel {
        entry_id: Default::default(),
        account_id: Set(expense_account_id),
        debit: Set(Some(total_value)),
        credit: Set(None),
        narration: Set(Some(format!(
            "Allocation of - Req #{}",
            payload.requirement_id
        ))),
        txn_date: Set(chrono::Utc::now().date_naive()),
        reference_table: Set(Some("allocations".into())),
        reference_id: Set(Some(allocation_model.allocation_id)),
        created_by: Set(Some(payload.allocated_by)),
        created_at: Set(chrono::Utc::now().into()),
        txn_group_id: Set(txn_group_id),
        ..Default::default()
    };

    debit_entry.insert(txn).await.map_err(|e| {
        tracing::error!("Failed to insert debit entry: {}", e);
        format!("Failed to insert debit entry: {}", e)
    })?;

    if let Some(asset_account) = ledger_accounts::Entity::find_by_id(asset_account_id)
        .one(txn)
        .await
        .map_err(|e| {
            tracing::error!("Failed to fetch asset account {}: {}", asset_account_id, e);
            format!("Failed to fetch asset account: {}", e)
        })?
    {
        let mut asset_active: ledger_accounts::ActiveModel = asset_account.into();
        let current_balance = asset_active.current_balance.take().unwrap_or_default();
        tracing::debug!(
            "Asset account {} current_balance={} total_value={}",
            asset_account_id,
            current_balance,
            total_value
        );

        asset_active.current_balance = Set(current_balance - total_value);

        asset_active.update(txn).await.map_err(|e| {
            tracing::error!(
                "Failed to update asset account {} balance: {}",
                asset_account_id,
                e
            );
            format!("Failed to update asset account balance: {}", e)
        })?;
        tracing::info!(
            "Updated asset account {} balance -> {}",
            asset_account_id,
            current_balance - total_value
        );
    }

    if let Some(expense_account) = ledger_accounts::Entity::find_by_id(expense_account_id)
        .one(txn)
        .await
        .map_err(|e| {
            tracing::error!(
                "Failed to fetch expense account {}: {}",
                expense_account_id,
                e
            );
            format!("Failed to fetch expense account: {}", e)
        })?
    {
        let mut expense_active: ledger_accounts::ActiveModel = expense_account.into();
        let current_balance = expense_active.current_balance.take().unwrap_or_default();
        tracing::debug!(
            "Expense account {} current_balance={} total_value={}",
            expense_account_id,
            current_balance,
            total_value
        );

        expense_active.current_balance = Set(current_balance + total_value);

        expense_active.update(txn).await.map_err(|e| {
            tracing::error!(
                "Failed to update expense account {} balance: {}",
                expense_account_id,
                e
            );
            format!("Failed to update expense account balance: {}", e)
        })?;
        tracing::info!(
            "Updated expense account {} balance -> {}",
            expense_account_id,
            current_balance + total_value
        );
    }

    Ok(format!(
        "Requirement {} approved, allocation created, inventory updated, and movement logged",
        requirement_id
    ))
}
