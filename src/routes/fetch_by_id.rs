use axum::{routing::get, Router};
use sea_orm::DatabaseConnection;

use crate::handlers::fetch_by_id::get_farmer_commission_history_by_id_handler;

pub fn fetch_by_id() -> Router<DatabaseConnection> {
    Router::new().route(
        "/farmer_commission/{id}",
        get(get_farmer_commission_history_by_id_handler),
    )
}
