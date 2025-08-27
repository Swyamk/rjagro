use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "stock_receipts")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub lot_id: i32,
    pub purchase_id: Option<i32>,
    pub item_code: String,
    pub received_qty: Decimal,
    pub remaining_qty: Decimal,
    pub unit_cost: Decimal,
    pub received_date: Date,
    pub supplier: Option<String>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::purchases::Entity",
        from = "Column::PurchaseId",
        to = "super::purchases::Column::PurchaseId",
        on_update = "Cascade",
        on_delete = "SetNull"
    )]
    Purchases,

    #[sea_orm(
        belongs_to = "super::items::Entity",
        from = "Column::ItemCode",
        to = "super::items::Column::ItemCode",
        on_update = "Cascade",
        on_delete = "Restrict"
    )]
    Items,

    #[sea_orm(
        has_many = "super::batch_allocation_lines::Entity",
        from = "Column::LotId",
        to = "super::batch_allocation_lines::Column::LotId"
    )]
    BatchAllocationLines,
}

impl Related<super::purchases::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Purchases.def()
    }
}

impl Related<super::items::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Items.def()
    }
}

impl Related<super::batch_allocation_lines::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::BatchAllocationLines.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
