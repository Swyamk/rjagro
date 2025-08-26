use axum::{
    middleware,
    routing::{post, put},
    Router,
};
use entity::sea_orm_active_enums::UserRole;
use sea_orm::DatabaseConnection;

use crate::{
    auth::middleware::{require_roles_middleware, RequireRoles},
    handlers::batch_requirements::{
        approve_batch_requirement_handler, decline_batch_requirement_handler,
    },
};

pub fn admin() -> Router<DatabaseConnection> {
    Router::new()
        .route(
            "/decline_batch_requirement/{requirement_id}",
            put(decline_batch_requirement_handler),
        )
        .route(
            "/approve_batch_requirement",
            post(approve_batch_requirement_handler),
        )
        .layer(middleware::from_fn_with_state(
            RequireRoles::new(&[UserRole::Admin]),
            require_roles_middleware,
        ))
}
