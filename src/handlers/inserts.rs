use crate::models::*;
use axum::{extract::State, http::StatusCode, Json};
use entity::*;
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
    let new_purchase = purchases::ActiveModel {
        item_code: Set(payload.item_code),
        cost_per_unit: Set(payload.cost_per_unit),
        total_cost: Set(payload.total_cost),
        purchase_date: Set(payload.purchase_date),
        supplier: Set(payload.supplier),
        created_by: Set(payload.created_by),
        ..Default::default()
    };

    new_purchase.insert(&db).await.map(Json).map_err(|err| {
        eprintln!("Failed to insert purchase: {}", err);
        StatusCode::INTERNAL_SERVER_ERROR
    })
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
        start_date: Set(payload.start_date),
        end_date: Set(payload.end_date),
        initial_bird_count: Set(payload.initial_bird_count),
        current_bird_count: Set(payload.current_bird_count),
        status: Set(payload.status),
        ..Default::default()
    };
    new_batch
        .insert(&db)
        .await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

/// Batch Requirements
pub async fn create_batch_requirement(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<CreateBatchRequirement>,
) -> Result<Json<batch_requirements::Model>, StatusCode> {
    let new_req = batch_requirements::ActiveModel {
        batch_id: Set(payload.batch_id),
        category: Set(payload.category),
        quantity: Set(payload.quantity),
        unit: Set(payload.unit),
        request_date: Set(payload.request_date),
        ..Default::default()
    };
    new_req
        .insert(&db)
        .await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

/// Batch Allocations
pub async fn create_batch_allocation(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<CreateBatchAllocation>,
) -> Result<Json<batch_allocations::Model>, StatusCode> {
    let new_alloc = batch_allocations::ActiveModel {
        requirement_id: Set(payload.requirement_id),
        purchase_id: Set(payload.purchase_id),
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
