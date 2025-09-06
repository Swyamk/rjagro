use sea_orm_migration::prelude::*;

use crate::m20250810_161418_iteration1::Batches;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(BatchClosureSummary::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(BatchClosureSummary::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(BatchClosureSummary::BatchId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(BatchClosureSummary::StartDate)
                            .date()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(BatchClosureSummary::EndDate)
                            .date()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(BatchClosureSummary::InitialChickenCount)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(BatchClosureSummary::AvailableChickenCount)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(BatchClosureSummary::Revenue)
                            .decimal_len(12, 2)
                            .not_null()
                            .default(0),
                    )
                    .col(
                        ColumnDef::new(BatchClosureSummary::GrossProfit)
                            .decimal_len(12, 2)
                            .not_null()
                            .default(0),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .from(BatchClosureSummary::Table, BatchClosureSummary::BatchId)
                            .to(Batches::Table, Batches::BatchId)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(BatchClosureSummary::Table).to_owned())
            .await
    }
}

#[derive(Iden)]
enum BatchClosureSummary {
    Table,
    Id,
    BatchId,
    StartDate,
    EndDate,
    InitialChickenCount,
    AvailableChickenCount,
    Revenue,
    GrossProfit,
}
