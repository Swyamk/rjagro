use axum::{routing::get, Router};
use sea_orm::{Database, DatabaseConnection};
// use migration::{Migrator, MigratorTrait};
use shuttle_runtime::SecretStore;
mod fetch_all;
mod routes;
use crate::routes::fetch_all::fetch_all;
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

    // 4. Build router
    let router = Router::new()
        .nest("/getall", fetch_all())
        .route("/", get(hello_world))
        .with_state(db);

    Ok(router.into())
}
