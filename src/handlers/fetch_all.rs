use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use entity::*;
use sea_orm::{DatabaseConnection, EntityTrait};

use crate::models::PurchaseWithItem;

// USERS
pub async fn get_users_handler(State(db): State<DatabaseConnection>) -> impl IntoResponse {
    match users::Entity::find().all(&db).await {
        Ok(data) => Json(data).into_response(),
        Err(e) => {
            eprintln!("Failed to fetch users: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}

// PRODUCTION_LINES
pub async fn get_production_lines_handler(
    State(db): State<DatabaseConnection>,
) -> impl IntoResponse {
    match production_lines::Entity::find().all(&db).await {
        Ok(data) => Json(data).into_response(),
        Err(e) => {
            eprintln!("Failed to fetch production lines: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}

// PURCHASES
pub async fn get_purchases_handler(State(db): State<DatabaseConnection>) -> impl IntoResponse {
    // find purchases and also the related item (LEFT JOIN semantics via find_also_related)
    match purchases::Entity::find()
        .find_also_related(items::Entity)
        .all(&db)
        .await
    {
        Ok(rows) => {
            let resp: Vec<PurchaseWithItem> = rows
                .into_iter()
                .map(|(p, item_opt)| PurchaseWithItem {
                    purchase_id: p.purchase_id,
                    item_code: p.item_code,
                    // if item missing, fall back to empty string (adjust if you prefer null)
                    item_name: item_opt.map(|i| i.item_name).unwrap_or_default(),
                    cost_per_unit: p.cost_per_unit,
                    total_cost: p.total_cost,
                    purchase_date: p.purchase_date,
                    supplier: p.supplier,
                    created_by: p.created_by,
                })
                .collect();

            (StatusCode::OK, Json(resp)).into_response()
        }
        Err(e) => {
            eprintln!("Failed to fetch purchases with items: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}

// ITEMS
pub async fn get_items_handler(State(db): State<DatabaseConnection>) -> impl IntoResponse {
    match items::Entity::find().all(&db).await {
        Ok(data) => Json(data).into_response(),
        Err(e) => {
            eprintln!("Failed to items table: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}

// BATCHES
pub async fn get_batches_handler(State(db): State<DatabaseConnection>) -> impl IntoResponse {
    match batches::Entity::find().all(&db).await {
        Ok(data) => Json(data).into_response(),
        Err(e) => {
            eprintln!("Failed to fetch batches: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}

// BATCH_REQUIREMENTS
pub async fn get_batch_requirements_handler(
    State(db): State<DatabaseConnection>,
) -> impl IntoResponse {
    match batch_requirements::Entity::find().all(&db).await {
        Ok(data) => Json(data).into_response(),
        Err(e) => {
            eprintln!("Failed to fetch batch requirements: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}

// BATCH_ALLOCATIONS
pub async fn get_batch_allocations_handler(
    State(db): State<DatabaseConnection>,
) -> impl IntoResponse {
    match batch_allocations::Entity::find().all(&db).await {
        Ok(data) => Json(data).into_response(),
        Err(e) => {
            eprintln!("Failed to fetch batch allocations: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}

// FARMERS
pub async fn get_farmers_handler(State(db): State<DatabaseConnection>) -> impl IntoResponse {
    match farmers::Entity::find().all(&db).await {
        Ok(data) => Json(data).into_response(),
        Err(e) => {
            eprintln!("Failed to fetch farmers: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}

// TRADERS
pub async fn get_traders_handler(State(db): State<DatabaseConnection>) -> impl IntoResponse {
    match traders::Entity::find().all(&db).await {
        Ok(data) => Json(data).into_response(),
        Err(e) => {
            eprintln!("Failed to fetch traders: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}

// SUPPLIERS
pub async fn get_suppliers_handler(State(db): State<DatabaseConnection>) -> impl IntoResponse {
    match suppliers::Entity::find().all(&db).await {
        Ok(data) => Json(data).into_response(),
        Err(e) => {
            eprintln!("Failed to fetch suppliers: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}

// BIRD_COUNT_HISTORY
pub async fn get_bird_count_history_handler(
    State(db): State<DatabaseConnection>,
) -> impl IntoResponse {
    match bird_count_history::Entity::find().all(&db).await {
        Ok(data) => Json(data).into_response(),
        Err(e) => {
            eprintln!("Failed to fetch bird count history: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}

// BIRD_SELL_HISTORY
pub async fn get_bird_sell_history_handler(
    State(db): State<DatabaseConnection>,
) -> impl IntoResponse {
    match bird_sell_history::Entity::find().all(&db).await {
        Ok(data) => Json(data).into_response(),
        Err(e) => {
            eprintln!("Failed to fetch bird sell history: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}
