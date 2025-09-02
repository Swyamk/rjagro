//! `SeaORM` Entity for farmer_commission_history

use sea_orm::entity::prelude::*;
use serde::Serialize;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize)]
#[sea_orm(table_name = "farmer_commission_history")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub farmer_id: i32,
    #[sea_orm(column_type = "Decimal(Some((18, 2)))")]
    pub commission_amount: Decimal,
    #[sea_orm(column_type = "Text")]
    pub description: Option<String>,
    pub created_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::farmers::Entity",
        from = "Column::FarmerId",
        to = "super::farmers::Column::FarmerId"
    )]
    Farmers,
}

impl Related<super::farmers::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Farmers.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
