use std::sync::Arc;

use axum::routing::post;
use axum::{routing::get, Router};
// use migration::{Migrator, MigratorTrait};
use sea_orm::{Database, DatabaseConnection};
use shuttle_runtime::SecretStore;
mod auth;
mod routes;
mod handlers;
mod models;
use crate::auth::login::login_handler;
use crate::routes::inserts::insert_routes;
use crate::{auth::middleware::auth_middleware, routes::fetch_all::fetch_all};
async fn hello_world() -> &'static str {
    "Hello, world!"
}

#[shuttle_runtime::main]
async fn main(#[shuttle_runtime::Secrets] secret_store: SecretStore) -> shuttle_axum::ShuttleAxum {
    let database_url = secret_store
        .get("DATABASE_URL")
        .expect("DATABASE_URL must be set in Secrets.toml");

    // 2. Connect to DB
    let db: DatabaseConnection = Database::connect(&database_url)
        .await
        .expect("Failed to connect to database");

    // 3. Run migrations
    // Migrator::up(&db, None)
    //     .await
    //     .expect("Migration failed");
    // Migrator::fresh(&db).await.expect("failllled");

    // 4. Build router
    let shared_secrets = Arc::new(secret_store);
    let router = Router::new()
        .nest("/getall", fetch_all())
        .nest("/insert",insert_routes())
        .route("/", get(hello_world))
        .layer(axum::middleware::from_fn_with_state(
            shared_secrets.clone(),
            auth_middleware,
        ))
        .route("/login", post(login_handler))
        .with_state(db);

    Ok(router.into())
}
