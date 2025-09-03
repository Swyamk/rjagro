//! `SeaORM` Entity, generated

use sea_orm::entity::prelude::*;
use serde::Serialize;

use crate::sea_orm_active_enums::ItemCategory;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize)]
#[sea_orm(table_name = "items")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub item_code: String,
    pub item_name: String,
    pub unit: Option<String>,
    pub item_category: ItemCategory,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
