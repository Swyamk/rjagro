use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use entity::{batch_allocations, sea_orm_active_enums::RequirementStatus};
use entity::{
    batch_requirements, inventory, inventory_movements, sea_orm_active_enums::MovementType,
};
use sea_orm::{ActiveModelTrait, DatabaseConnection, EntityTrait, Set};
use sea_orm::{DatabaseTransaction, IntoActiveModel, TransactionTrait};

use crate::models::{ApprovePayload, ResponseMessage};

pub async fn decline_batch_requirement_handler(
    Path(requirement_id): Path<i32>,
    State(db): State<DatabaseConnection>,
) -> impl IntoResponse {
    // Fetch the requirement by primary key
    match batch_requirements::Entity::find_by_id(requirement_id)
        .one(&db)
        .await
    {
        Ok(Some(requirement)) => {
            let mut active_model = requirement.into_active_model();
            active_model.status = Set(RequirementStatus::Decline);

            match active_model.update(&db).await {
                Ok(_) => (
                    StatusCode::OK,
                    Json(ResponseMessage {
                        message: format!("Requirement {} declined successfully", requirement_id),
                    }),
                )
                    .into_response(),
                Err(e) => {
                    eprintln!("Failed to update requirement {}: {}", requirement_id, e);
                    StatusCode::INTERNAL_SERVER_ERROR.into_response()
                }
            }
        }
        Ok(None) => (
            StatusCode::NOT_FOUND,
            Json(ResponseMessage {
                message: format!("Requirement {} not found", requirement_id),
            }),
        )
            .into_response(),
        Err(e) => {
            eprintln!("Failed to fetch requirement {}: {}", requirement_id, e);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}

pub async fn approve_batch_requirement_handler(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<ApprovePayload>,
) -> impl IntoResponse {
    // Start transaction
    match db.begin().await {
        Ok(txn) => {
            let result = approve_and_allocate(payload.requirement_id, payload, &txn).await;

            match result {
                Ok(msg) => {
                    if let Err(e) = txn.commit().await {
                        eprintln!("Transaction commit failed: {}", e);
                        return StatusCode::INTERNAL_SERVER_ERROR.into_response();
                    }
                    (StatusCode::OK, Json(ResponseMessage { message: msg })).into_response()
                }
                Err(e) => {
                    eprintln!("Transaction failed: {}", e);
                    // rollback happens automatically when txn is dropped
                    StatusCode::INTERNAL_SERVER_ERROR.into_response()
                }
            }
        }
        Err(e) => {
            eprintln!("Failed to start transaction: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}

async fn approve_and_allocate(
    requirement_id: i32,
    payload: ApprovePayload,
    txn: &DatabaseTransaction,
) -> Result<String, String> {
    use sea_orm::ActiveValue::Set;

    // 1. Fetch requirement
    let requirement = batch_requirements::Entity::find_by_id(requirement_id)
        .one(txn)
        .await
        .map_err(|e| format!("DB fetch error: {}", e))?
        .ok_or_else(|| format!("Requirement {} not found", requirement_id))?;

    // 2. Update requirement status -> Accept
    let mut active_model = requirement.clone().into_active_model();
    active_model.status = Set(RequirementStatus::Accept);
    active_model
        .update(txn)
        .await
        .map_err(|e| format!("Failed to update requirement: {}", e))?;

    // 3. Insert allocation
    let allocation = batch_allocations::ActiveModel {
        allocation_id: Default::default(),
        requirement_id: Set(payload.requirement_id),
        allocated_qty: Set(payload.allocated_qty),
        allocation_date: Set(payload.allocation_date),
        allocated_by: Set(payload.allocated_by),
    };

    let allocation_model = allocation
        .insert(txn)
        .await
        .map_err(|e| format!("Failed to insert allocation: {}", e))?;

    // 4. Update inventory (deduct allocated qty)
    if let Some(inv) = inventory::Entity::find_by_id(requirement.item_code.clone())
        .one(txn)
        .await
        .map_err(|e| format!("Failed to fetch inventory: {}", e))?
    {
        let mut active_inv: inventory::ActiveModel = inv.into();
        let current = active_inv.current_qty.take().unwrap_or_default();

        if current < payload.allocated_qty {
            return Err(format!(
                "Not enough stock for item {}. Required: {}, Available: {}",
                requirement.item_code, payload.allocated_qty, current
            ));
        }

        active_inv.current_qty = Set(current - payload.allocated_qty);
        active_inv.last_updated = Set(chrono::Utc::now().into());

        active_inv
            .update(txn)
            .await
            .map_err(|e| format!("Failed to update inventory: {}", e))?;
    } else {
        return Err(format!(
            "No inventory record found for item {}",
            requirement.item_code
        ));
    }

    // 5. Insert inventory movement (OUT)
    let movement = inventory_movements::ActiveModel {
        movement_id: Default::default(),
        item_code: Set(requirement.item_code.clone()),
        movement_type: Set(MovementType::Allocation),
        qty_change: Set(-payload.allocated_qty),
        reference_id: Set(Some(allocation_model.allocation_id)),
        ..Default::default()
    };

    movement
        .insert(txn)
        .await
        .map_err(|e| format!("Failed to insert inventory movement: {}", e))?;

    Ok(format!(
        "Requirement {} approved, allocation created, inventory updated, and movement logged",
        requirement_id
    ))
}
