use crate::m20250810_161418_iteration1::Items;
use sea_orm_migration::prelude::extension::postgres::Type;
use sea_orm_migration::prelude::*;
use sea_orm_migration::schema::*;
#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Create enum type for movement_type
        manager
            .create_type(
                Type::create()
                    .as_enum(MovementType::Table)
                    .values([
                        MovementType::Purchase,
                        MovementType::Allocation,
                        MovementType::Adjustment,
                        MovementType::Transfer,
                    ])
                    .to_owned(),
            )
            .await?;

        // Create inventory table
        manager
            .create_table(
                Table::create()
                    .table(Inventory::Table)
                    .if_not_exists()
                    .col(pk_auto(Inventory::InventoryId))
                    .col(string_len(Inventory::ItemCode, 100).not_null())
                    .col(
                        decimal_len(Inventory::CurrentQty, 12, 2)
                            .not_null()
                            .default(0),
                    )
                    .col(
                        timestamp_with_time_zone(Inventory::LastUpdated)
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_inventory_item")
                            .from(Inventory::Table, Inventory::ItemCode)
                            .to(Items::Table, Items::ItemCode)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Create inventory_movements table
        manager
            .create_table(
                Table::create()
                    .table(InventoryMovements::Table)
                    .if_not_exists()
                    .col(pk_auto(InventoryMovements::MovementId))
                    .col(string_len(InventoryMovements::ItemCode, 100).not_null())
                    .col(decimal_len(InventoryMovements::QtyChange, 12, 2).not_null())
                    .col(
                        ColumnDef::new(InventoryMovements::MovementType)
                            .custom(MovementType::Table)
                            .not_null(),
                    )
                    .col(integer(InventoryMovements::ReferenceId))
                    .col(
                        timestamp_with_time_zone(InventoryMovements::MovementDate)
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_inventory_movements_item")
                            .from(InventoryMovements::Table, InventoryMovements::ItemCode)
                            .to(Items::Table, Items::ItemCode)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop tables
        manager
            .drop_table(Table::drop().table(InventoryMovements::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(Inventory::Table).to_owned())
            .await?;

        // Drop enum type
        manager
            .drop_type(Type::drop().name(MovementType::Table).to_owned())
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum Inventory {
    Table,
    InventoryId,
    ItemCode,
    CurrentQty,
    LastUpdated,
}

#[derive(DeriveIden)]
enum InventoryMovements {
    Table,
    MovementId,
    ItemCode,
    QtyChange,
    MovementType,
    ReferenceId,
    MovementDate,
}

#[derive(DeriveIden)]
enum MovementType {
    Table,
    Purchase,
    Allocation,
    Adjustment,
    Transfer,
}
