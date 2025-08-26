use sea_orm::entity::prelude::*;
use serde::Serialize;

use crate::sea_orm_active_enums::LedgerAccountType;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize)]
#[sea_orm(table_name = "ledger_entries")]
pub struct Model {
    /// row-level primary key
    #[sea_orm(primary_key)]
    pub entry_id: i32,

    pub transaction_type: LedgerAccountType,

    /// Debit amount
    #[sea_orm(column_type = "Decimal(Some((18, 2)))")]
    pub debit: Option<Decimal>,

    /// Credit amount
    #[sea_orm(column_type = "Decimal(Some((18, 2)))")]
    pub credit: Option<Decimal>,

    /// Transaction date
    pub txn_date: Date,

    /// Source table (e.g. purchases, bird_sell_history)
    pub reference_table: Option<String>,

    /// ID in reference table
    pub reference_id: Option<i32>,

    /// Narration / notes
    pub narration: Option<String>,

    /// Metadata
    pub created_at: DateTimeWithTimeZone,
    pub created_by: Option<i32>, 
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::users::Entity",
        from = "Column::CreatedBy",
        to = "super::users::Column::UserId",
        on_update = "Cascade",
        on_delete = "SetNull"
    )]
    Users,
}

impl Related<super::users::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Users.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
