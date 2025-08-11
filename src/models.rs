use entity::sea_orm_active_enums::{BatchStatus, PurchaseCategory, RequirementCategory, SupplierType};
use sea_orm::prelude::Decimal;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct CreateProductionLine {
    pub line_name: String,
    pub supervisor_id: i32,
}

#[derive(Deserialize)]
pub struct CreatePurchase {
    pub category: PurchaseCategory,
    pub item_name: String,
    pub quantity: Decimal,
    pub unit: String,
    pub cost_per_unit: Decimal,
    pub total_cost: Decimal,
    pub purchase_date: chrono::NaiveDate,
    pub supplier: String,
    pub created_by: i32,
}

#[derive(Deserialize)]
pub struct CreateBatch {
    pub line_id: i32,
    pub supervisor_id: i32,
    pub start_date: chrono::NaiveDate,
    pub end_date: chrono::NaiveDate,
    pub initial_bird_count: i32,
    pub current_bird_count: i32,
    pub status: Option<BatchStatus>,
}

#[derive(Deserialize)]
pub struct CreateBatchRequirement {
    pub batch_id: i32,
    pub category: RequirementCategory,
    pub quantity: Decimal,
    pub unit: String,
    pub request_date: chrono::NaiveDate,
}

#[derive(Deserialize)]
pub struct CreateBatchAllocation {
    pub requirement_id: i32,
    pub purchase_id: i32,
    pub allocated_qty: Decimal,
    pub allocation_date: chrono::NaiveDate,
    pub allocated_by: i32,
}

#[derive(Deserialize)]
pub struct CreateFarmer {
    pub name: String,
    pub phone_number: String,
    pub address: String,
    pub bank_account_no: String,
    pub bank_name: String,
    pub ifsc_code: String,
    pub area_size: Decimal,
}

#[derive(Deserialize)]
pub struct CreateTrader {
    pub name: String,
    pub phone_number: String,
    pub address: String,
    pub bank_account_no: String,
    pub bank_name: String,
    pub ifsc_code: String,
    pub area: String,
}

#[derive(Deserialize)]
pub struct CreateSupplier {
    pub supplier_type: SupplierType,
    pub name: String,
    pub phone_number: String,
    pub address: String,
    pub bank_account_no: String,
    pub bank_name: String,
    pub ifsc_code: String,
}

#[derive(Deserialize)]
pub struct CreateBirdCountHistory {
    pub batch_id: i32,
    pub record_date: chrono::NaiveDate,
    pub deaths: i32,
    pub additions: i32,
    pub notes: String,
}

#[derive(Deserialize)]
pub struct CreateBirdSellHistory {
    pub batch_id: i32,
    pub trader_id: i32,
    pub sale_date: chrono::NaiveDate,
    pub quantity_sold: i32,
    pub price_per_bird: Decimal,
    pub total_amount: Decimal,
    pub notes: String,
}
