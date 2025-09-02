use axum::{
    extract::{Path, State},
    Json,
};
use entity::farmer_commission_history;
use reqwest::StatusCode;
use sea_orm::ColumnTrait;
use sea_orm::DatabaseConnection;
use sea_orm::EntityTrait;
use sea_orm::QueryFilter;
use sea_orm::QueryOrder;

pub async fn get_farmer_commission_history_by_id_handler(
    State(db): State<DatabaseConnection>,
    Path(farmer_id): Path<i32>,
) -> Result<Json<Vec<farmer_commission_history::Model>>, StatusCode> {
    match farmer_commission_history::Entity::find()
        .filter(farmer_commission_history::Column::FarmerId.eq(farmer_id))
        .order_by_desc(farmer_commission_history::Column::CreatedAt)
        .all(&db)
        .await
    {
        Ok(records) => Ok(Json(records)),
        Err(e) => {
            eprintln!(
                "Failed to fetch commission history for farmer {}: {}",
                farmer_id, e
            );
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
