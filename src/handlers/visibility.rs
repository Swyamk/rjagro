use axum::{extract::Extension, response::IntoResponse, Json};
use entity::sea_orm_active_enums::UserRole;
use std::collections::HashMap;

pub async fn get_visibility_handler(
    Extension(role): Extension<UserRole>,
) -> impl IntoResponse {
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

    visibility.insert(UserRole::Accountant, vec!["purchases", "suppliers"]);

    // Return only the tables visible for this role
    let tables = visibility.get(&role).cloned().unwrap_or_default();
    Json(tables).into_response()
}
