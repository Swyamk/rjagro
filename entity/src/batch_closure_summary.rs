use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "batch_closure_summary")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub batch_id: i32,
    pub start_date: Date,
    pub end_date: Date,
    pub initial_chicken_count: i32,
    pub available_chicken_count: i32,
    #[sea_orm(column_type = "Decimal(Some((12, 2)))")]
    pub revenue: Decimal,
    #[sea_orm(column_type = "Decimal(Some((12, 2)))")]
    pub gross_profit: Decimal,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::batches::Entity",
        from = "Column::BatchId",
        to = "super::batches::Column::BatchId",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Batches,
}

impl Related<super::batches::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Batches.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
