use crate::models::*;
use axum::{extract::State, http::StatusCode, Json};
use chrono::Utc;
use entity::{sea_orm_active_enums::RequirementStatus, *};
use sea_orm::EntityTrait;
use sea_orm::TransactionTrait;
use sea_orm::{ActiveModelTrait, DatabaseConnection, Set};
use tracing::error;
use uuid::Uuid;

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

pub async fn create_item(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<CreateItem>,
) -> Result<Json<items::Model>, StatusCode> {
    let new_item = items::ActiveModel {
        item_code: Set(payload.item_code),
        item_name: Set(payload.item_name),
        item_category: Set(payload.item_category),
        unit: Set(payload.unit),
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

pub async fn create_ledger_account(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<CreateLedgerAccount>,
) -> Result<Json<ledger_accounts::Model>, StatusCode> {
    let new_account = ledger_accounts::ActiveModel {
        name: Set((payload.name).to_lowercase()),
        account_type: Set(payload.account_type),
        current_balance: Set(payload.current_balance),
        ..Default::default()
    };

    new_account.insert(&db).await.map(Json).map_err(|err| {
        eprintln!("Failed to insert ledger account: {:?}", err);
        StatusCode::INTERNAL_SERVER_ERROR
    })
}

pub async fn create_farmer_commission(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<CreateFarmerCommission>,
) -> Result<Json<farmer_commission_history::Model>, StatusCode> {
    const CASH_ACCOUNT_ID: i32 = 101;
    const COMMISSION_EXPENSE_ACCOUNT_ID: i32 = 106;

    let txn = db.begin().await.map_err(|e| {
        error!("Failed to start transaction: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    // 1) insert farmer commission history
    let new_commission = farmer_commission_history::ActiveModel {
        farmer_id: Set(payload.farmer_id),
        commission_amount: Set(payload.commission_amount),
        description: Set(payload.description),
        created_at: Set(Utc::now().into()),
        ..Default::default()
    };

    let saved_commission = new_commission.insert(&txn).await.map_err(|e| {
        error!("Failed to insert farmer commission history: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    // 2) create ledger entries
    let txn_group_id = Uuid::new_v4();
    let today = chrono::Local::now().date_naive();

    let debit_entry = ledger_entries::ActiveModel {
        account_id: Set(COMMISSION_EXPENSE_ACCOUNT_ID),
        debit: Set(Some(payload.commission_amount)),
        credit: Set(None),
        txn_date: Set(today),
        reference_table: Set(Some("farmer_commission_history".to_string())),
        reference_id: Set(Some(saved_commission.id)),
        narration: Set(Some("Farmer commission debit".to_string())),
        txn_group_id: Set(txn_group_id),
        created_by: Set(payload.created_by),
        ..Default::default()
    };

    let credit_entry = ledger_entries::ActiveModel {
        account_id: Set(CASH_ACCOUNT_ID),
        debit: Set(None),
        credit: Set(Some(payload.commission_amount)),
        txn_date: Set(today),
        reference_table: Set(Some("farmer_commission_history".to_string())),
        reference_id: Set(Some(saved_commission.id)),
        narration: Set(Some("Cash paid for farmer commission".to_string())),
        txn_group_id: Set(txn_group_id),
        created_by: Set(payload.created_by),
        ..Default::default()
    };

    debit_entry.insert(&txn).await.map_err(|e| {
        error!("Failed to insert debit ledger entry: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    credit_entry.insert(&txn).await.map_err(|e| {
        error!("Failed to insert credit ledger entry: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    // 3) update balances
    let mut commission_acct: ledger_accounts::ActiveModel =
        ledger_accounts::Entity::find_by_id(COMMISSION_EXPENSE_ACCOUNT_ID)
            .one(&txn)
            .await
            .map_err(|e| {
                error!("Failed to fetch commission account: {:?}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?
            .ok_or_else(|| {
                error!(
                    "Commission account not found: {}",
                    COMMISSION_EXPENSE_ACCOUNT_ID
                );
                StatusCode::INTERNAL_SERVER_ERROR
            })?
            .into();

    commission_acct.current_balance =
        Set(commission_acct.current_balance.unwrap() + payload.commission_amount);

    commission_acct.update(&txn).await.map_err(|e| {
        error!("Failed to update commission account balance: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let mut cash_acct: ledger_accounts::ActiveModel =
        ledger_accounts::Entity::find_by_id(CASH_ACCOUNT_ID)
            .one(&txn)
            .await
            .map_err(|e| {
                error!("Failed to fetch cash account: {:?}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?
            .ok_or_else(|| {
                error!("Cash account not found: {}", CASH_ACCOUNT_ID);
                StatusCode::INTERNAL_SERVER_ERROR
            })?
            .into();

    cash_acct.current_balance = Set(cash_acct.current_balance.unwrap() - payload.commission_amount);

    cash_acct.update(&txn).await.map_err(|e| {
        error!("Failed to update cash account balance: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    txn.commit().await.map_err(|e| {
        error!("Failed to commit transaction: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(saved_commission))
}
