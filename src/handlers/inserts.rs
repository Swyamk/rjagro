use crate::models::*;
use axum::{extract::State, http::StatusCode, Json};
use chrono::Utc;
use entity::sea_orm_active_enums::{LedgerAccountType, MovementType};
use entity::{sea_orm_active_enums::RequirementStatus, *};
use sea_orm::EntityTrait;
use sea_orm::TransactionTrait;
use sea_orm::{ActiveModelTrait, DatabaseConnection, Set};

/// Production Lines
pub async fn create_production_line(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<CreateProductionLine>,
) -> Result<Json<production_lines::Model>, StatusCode> {
    let new_line = production_lines::ActiveModel {
        line_name: Set(payload.line_name),
        supervisor_id: Set(payload.supervisor_id),
        ..Default::default()
    };
    new_line
        .insert(&db)
        .await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

/// Purchases
pub async fn create_purchase(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<CreatePurchase>,
) -> Result<Json<purchases::Model>, StatusCode> {
    let txn = db.begin().await.map_err(|err| {
        eprintln!("Failed to begin transaction: {}", err);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    // Insert purchase
    let new_purchase = purchases::ActiveModel {
        item_code: Set(payload.item_code.clone()),
        cost_per_unit: Set(payload.cost_per_unit),
        total_cost: Set(payload.total_cost),
        purchase_date: Set(payload.purchase_date),
        supplier: Set(payload.supplier.clone()),
        created_by: Set(payload.created_by),
        ..Default::default()
    };

    let purchase = new_purchase.insert(&txn).await.map_err(|err| {
        eprintln!("Failed to insert purchase: {}", err);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    // Insert/Update inventory
    if let Some(inv) = inventory::Entity::find_by_id(payload.item_code.clone())
        .one(&txn)
        .await
        .map_err(|err| {
            eprintln!("Failed to fetch inventory: {}", err);
            StatusCode::INTERNAL_SERVER_ERROR
        })?
    {
        // Item already exists → update
        let mut active_inv: inventory::ActiveModel = inv.into();
        active_inv.current_qty =
            Set(active_inv.current_qty.take().unwrap_or_default() + payload.quantity);
        active_inv.last_updated = Set(Utc::now().into());
        active_inv.update(&txn).await.map_err(|err| {
            eprintln!("Failed to update inventory: {}", err);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
    } else {
        // Item does not exist → create
        let new_inv = inventory::ActiveModel {
            item_code: Set(payload.item_code.clone()),
            current_qty: Set(payload.quantity),
            last_updated: Set(Utc::now().into()),
            ..Default::default()
        };
        new_inv.insert(&txn).await.map_err(|err| {
            eprintln!("Failed to insert inventory: {}", err);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
    }

    // Insert inventory movement
    let movement = inventory_movements::ActiveModel {
        item_code: Set(payload.item_code.clone()),
        movement_type: Set(MovementType::Purchase),
        qty_change: Set(payload.quantity),
        reference_id: Set(Some(purchase.purchase_id)),
        ..Default::default()
    };

    movement.insert(&txn).await.map_err(|err| {
        eprintln!("Failed to insert inventory movement: {}", err);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let total_cost = payload.total_cost;

    // Debit → Inventory
    let debit_entry = ledger_entries::ActiveModel {
        transaction_type: Set(LedgerAccountType::Asset),
        debit: Set(total_cost),
        credit: Set(None),
        txn_date: Set(purchase.purchase_date),
        reference_table: Set(Some("purchases".into())),
        reference_id: Set(Some(purchase.purchase_id)),
        narration: Set(Some(format!(
            "Purchase of {} (item {})",
            payload.quantity, payload.item_code
        ))),
        created_at: Set(Utc::now().into()),
        created_by: Set(payload.created_by),
        ..Default::default()
    };

    debit_entry.insert(&txn).await.map_err(|err| {
        eprintln!("Failed to insert ledger debit entry: {}", err);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    // Credit → chosen account (Cash / Payables etc.)
    let credit_entry = ledger_entries::ActiveModel {
        transaction_type: Set(payload.payment_account.clone()), 
        debit: Set(None),
        credit: Set(total_cost),
        txn_date: Set(purchase.purchase_date),
        reference_table: Set(Some("purchases".into())),
        reference_id: Set(Some(purchase.purchase_id)),
        narration: Set(Some(format!(
            "Payment for purchase of {} (item {})",
            payload.quantity, payload.item_code
        ))),
        created_at: Set(Utc::now().into()),
        created_by: Set(payload.created_by),
        ..Default::default()
    };

    credit_entry.insert(&txn).await.map_err(|err| {
        eprintln!("Failed to insert ledger credit entry: {}", err);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    txn.commit().await.map_err(|err| {
        eprintln!("Failed to commit transaction: {}", err);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(purchase))
}

pub async fn create_item(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<CreateItem>,
) -> Result<Json<items::Model>, StatusCode> {
    let new_item = items::ActiveModel {
        item_code: Set(payload.item_code),
        item_name: Set(payload.item_name),
        unit: Set(payload.unit),
        ..Default::default()
    };
    new_item
        .insert(&db)
        .await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

/// Batches
pub async fn create_batch(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<CreateBatch>,
) -> Result<Json<batches::Model>, StatusCode> {
    let new_batch = batches::ActiveModel {
        line_id: Set(payload.line_id),
        supervisor_id: Set(payload.supervisor_id),
        farmer_id: Set(payload.farmer_id),
        start_date: Set(payload.start_date),
        end_date: Set(payload.end_date),
        initial_bird_count: Set(payload.initial_bird_count),
        current_bird_count: Set(payload.current_bird_count),
        ..Default::default()
    };

    new_batch
        .insert(&db)
        .await
        .map(Json)
        .inspect_err(|err| eprintln!("Failed to insert batch: {}", err))
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

/// Batch Requirements

pub async fn create_batch_requirement(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<CreateBatchRequirement>,
) -> Result<Json<batch_requirements::Model>, StatusCode> {
    let new_req = batch_requirements::ActiveModel {
        batch_id: Set(payload.batch_id),
        line_id: Set(payload.line_id),
        supervisor_id: Set(payload.supervisor_id),
        item_code: Set(payload.item_code.clone()),
        quantity: Set(payload.quantity),
        request_date: Set(payload.request_date),
        // 👇 ensure status is always set
        status: Set(RequirementStatus::Pending),
        ..Default::default()
    };

    match new_req.insert(&db).await {
        Ok(model) => Ok(Json(model)),

        Err(e) => {
            eprintln!("❌ Failed to insert batch requirement: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

/// Batch Allocations
pub async fn create_batch_allocation(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<CreateBatchAllocation>,
) -> Result<Json<batch_allocations::Model>, StatusCode> {
    let new_alloc = batch_allocations::ActiveModel {
        requirement_id: Set(payload.requirement_id),
        allocated_qty: Set(payload.allocated_qty),
        allocation_date: Set(payload.allocation_date),
        allocated_by: Set(payload.allocated_by),
        ..Default::default()
    };

    new_alloc
        .insert(&db)
        .await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

/// Farmers
pub async fn create_farmer(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<CreateFarmer>,
) -> Result<Json<farmers::Model>, StatusCode> {
    let new_farmer = farmers::ActiveModel {
        name: Set(payload.name),
        phone_number: Set(payload.phone_number),
        address: Set(payload.address),
        bank_account_no: Set(payload.bank_account_no),
        bank_name: Set(payload.bank_name),
        ifsc_code: Set(payload.ifsc_code),
        area_size: Set(payload.area_size),
        ..Default::default()
    };
    new_farmer
        .insert(&db)
        .await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

/// Traders
pub async fn create_trader(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<CreateTrader>,
) -> Result<Json<traders::Model>, StatusCode> {
    let new_trader = traders::ActiveModel {
        name: Set(payload.name),
        phone_number: Set(payload.phone_number),
        address: Set(payload.address),
        bank_account_no: Set(payload.bank_account_no),
        bank_name: Set(payload.bank_name),
        ifsc_code: Set(payload.ifsc_code),
        area: Set(payload.area),
        ..Default::default()
    };
    new_trader
        .insert(&db)
        .await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

/// Suppliers
pub async fn create_supplier(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<CreateSupplier>,
) -> Result<Json<suppliers::Model>, StatusCode> {
    let new_supplier = suppliers::ActiveModel {
        supplier_type: Set(payload.supplier_type),
        name: Set(payload.name),
        phone_number: Set(payload.phone_number),
        address: Set(payload.address),
        bank_account_no: Set(payload.bank_account_no),
        bank_name: Set(payload.bank_name),
        ifsc_code: Set(payload.ifsc_code),
        ..Default::default()
    };
    new_supplier
        .insert(&db)
        .await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

/// Bird Count History
pub async fn create_bird_count_history(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<CreateBirdCountHistory>,
) -> Result<Json<bird_count_history::Model>, StatusCode> {
    let new_record = bird_count_history::ActiveModel {
        batch_id: Set(payload.batch_id),
        record_date: Set(payload.record_date),
        deaths: Set(payload.deaths),
        additions: Set(payload.additions),
        notes: Set(payload.notes),
        ..Default::default()
    };
    new_record
        .insert(&db)
        .await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

/// Bird Sell History
pub async fn create_bird_sell_history(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<CreateBirdSellHistory>,
) -> Result<Json<bird_sell_history::Model>, StatusCode> {
    let new_sale = bird_sell_history::ActiveModel {
        batch_id: Set(payload.batch_id),
        trader_id: Set(payload.trader_id),
        sale_date: Set(payload.sale_date),
        quantity_sold: Set(payload.quantity_sold),
        price_per_bird: Set(payload.price_per_bird),
        total_amount: Set(payload.total_amount),
        notes: Set(payload.notes),
        ..Default::default()
    };
    new_sale
        .insert(&db)
        .await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}
