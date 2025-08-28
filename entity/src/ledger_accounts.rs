use sea_orm::entity::prelude::*;
use serde::Serialize;

use crate::sea_orm_active_enums::LedgerAccountType;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize)]
#[sea_orm(table_name = "ledger_accounts")]
pub struct Model {
    /// row-level primary key
    #[sea_orm(primary_key)]
    pub account_id: i32,

    /// Account name
    pub name: String,

    /// Account type (active enum)
    pub account_type: LedgerAccountType,

    /// Current balance stored for quick lookup
    #[sea_orm(column_type = "Decimal(Some((18, 2)))")]
    pub current_balance: Decimal,

    /// Metadata
    pub created_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::ledger_entries::Entity")]
    LedgerEntries,
}

impl Related<super::ledger_entries::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::LedgerEntries.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
