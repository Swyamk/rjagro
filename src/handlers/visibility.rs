use axum::{response::IntoResponse, Json};
use entity::sea_orm_active_enums::UserRole;
use std::collections::HashMap;

// todo add this into database, and create endpoints to manipulate it
pub async fn get_visibility_handler() -> impl IntoResponse {
    // Predefined table access per role
    let mut visibility: HashMap<UserRole, Vec<&'static str>> = HashMap::new();

    visibility.insert(
        UserRole::Admin,
        vec![
            "users",
            "production_lines",
            "purchases",
            "batches",
            "batch_requirements",
            "batch_allocations",
            "farmers",
            "traders",
            "suppliers",
            "bird_count_history",
            "bird_sell_history",
        ],
    );

    visibility.insert(
        UserRole::Supervisor,
        vec![
            "production_lines",
            "batches",
            "batch_requirements",
            "batch_allocations",
            "farmers",
            "traders",
            "bird_count_history",
            "bird_sell_history",
        ],
    );

    visibility.insert(
        UserRole::Accountant,
        vec![
            "purchases",
            "suppliers",
        ],
    );

    Json(visibility).into_response()
}
