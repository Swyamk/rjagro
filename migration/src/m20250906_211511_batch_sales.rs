use sea_orm_migration::prelude::*;

use crate::m20250810_161418_iteration1::{Batches, Items, Traders};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(BatchSales::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(BatchSales::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(BatchSales::ItemCode).string().not_null())
                    .col(ColumnDef::new(BatchSales::BatchId).integer().not_null())
                    .col(ColumnDef::new(BatchSales::TraderId).integer().not_null())
                    .col(ColumnDef::new(BatchSales::AvgWeight).decimal().not_null())
                    .col(ColumnDef::new(BatchSales::Rate).decimal().not_null())
                    .col(ColumnDef::new(BatchSales::Quantity).decimal().not_null())
                    .col(ColumnDef::new(BatchSales::Value).decimal().not_null())
                    .col(
                        ColumnDef::new(BatchSales::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .extra("DEFAULT now()".to_owned()),
                    )
                    // Foreign Keys
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-batch_sales-item_code")
                            .from(BatchSales::Table, BatchSales::ItemCode)
                            .to(Items::Table, Items::ItemCode)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-batch_sales-batch_id")
                            .from(BatchSales::Table, BatchSales::BatchId)
                            .to(Batches::Table, Batches::BatchId)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-batch_sales-trader_id")
                            .from(BatchSales::Table, BatchSales::TraderId)
                            .to(Traders::Table, Traders::TraderId)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(BatchSales::Table).to_owned())
            .await
    }
}

#[derive(Iden)]
enum BatchSales {
    Table,
    Id,
    ItemCode,
    BatchId,
    TraderId,
    AvgWeight,
    Rate,
    Quantity,
    Value,
    CreatedAt,
}
