use axum::{routing::get, Router};
use sea_orm::DatabaseConnection;

use crate::fetch_all::{
    get_users_handler,
    get_production_lines_handler,
    get_purchases_handler,
    get_batches_handler,
    get_batch_requirements_handler,
    get_batch_allocations_handler,
    get_farmers_handler,
    get_traders_handler,
    get_suppliers_handler,
    get_bird_count_history_handler,
    get_bird_sell_history_handler,
};

pub fn fetch_all() -> Router<DatabaseConnection> {
    Router::new()
        .route("/users", get(get_users_handler))
        .route("/production_lines", get(get_production_lines_handler))
        .route("/purchases", get(get_purchases_handler))
        .route("/batches", get(get_batches_handler))
        .route("/batch_requirements", get(get_batch_requirements_handler))
        .route("/batch_allocations", get(get_batch_allocations_handler))
        .route("/farmers", get(get_farmers_handler))
        .route("/traders", get(get_traders_handler))
        .route("/suppliers", get(get_suppliers_handler))
        .route("/bird_count_history", get(get_bird_count_history_handler))
        .route("/bird_sell_history", get(get_bird_sell_history_handler))
}
