use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use entity::*;
use sea_orm::{DatabaseConnection, EntityTrait};

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
    match purchases::Entity::find().all(&db).await {
        Ok(data) => Json(data).into_response(),
        Err(e) => {
            eprintln!("Failed to fetch purchases: {}", e);
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
