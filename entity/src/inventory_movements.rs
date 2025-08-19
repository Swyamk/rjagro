//! `SeaORM` Entity for inventory_movements

use sea_orm::entity::prelude::*;
use serde::Serialize;

use crate::sea_orm_active_enums::MovementType;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize)]
#[sea_orm(table_name = "inventory_movements")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub movement_id: i32,
    pub item_code: String, // FK → items.item_code
    #[sea_orm(column_type = "Decimal(Some((12, 2)))")]
    pub qty_change: Decimal,
    pub movement_type: MovementType,
    pub reference_id: Option<i32>,
    pub movement_date: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::items::Entity",
        from = "Column::ItemCode",
        to = "super::items::Column::ItemCode",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Items,
}

impl Related<super::items::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Items.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
