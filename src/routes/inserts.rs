use axum::middleware::from_fn_with_state;
use axum::{routing::post, Router};
use entity::sea_orm_active_enums::UserRole;
use sea_orm::DatabaseConnection;

use crate::{
    auth::middleware::{require_roles_middleware, RequireRoles},
    handlers::{
        inserts::{
            create_batch, create_batch_allocation, create_batch_requirement,
            create_bird_count_history, create_bird_sell_history, create_farmer, create_item,
            create_ledger_account, create_production_line, create_supplier, create_trader,
        },
        purchases::create_purchase,
    },
};

pub fn insert_routes() -> Router<DatabaseConnection> {
    Router::new()
        .route("/ledger_account", post(create_ledger_account))
        .layer(from_fn_with_state(
            RequireRoles::new(&[UserRole::Admin]),
            require_roles_middleware,
        ))
        .route("/production_lines", post(create_production_line))
        .route("/purchases", post(create_purchase))
        .route("/items", post(create_item))
        .route("/batches", post(create_batch))
        .route("/batch_requirements", post(create_batch_requirement))
        .route("/batch_allocations", post(create_batch_allocation))
        .route("/farmers", post(create_farmer))
        .route("/traders", post(create_trader))
        .route("/suppliers", post(create_supplier))
        .route("/bird_count_history", post(create_bird_count_history))
        .route("/bird_sell_history", post(create_bird_sell_history))
}
