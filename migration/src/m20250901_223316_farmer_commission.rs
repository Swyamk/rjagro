use sea_orm_migration::prelude::*;

use crate::m20250810_161418_iteration1::Farmers;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(FarmerCommissionHistory::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(FarmerCommissionHistory::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(FarmerCommissionHistory::FarmerId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(FarmerCommissionHistory::CommissionAmount)
                            .decimal_len(10, 2)
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(FarmerCommissionHistory::Description)
                            .string()
                            .null(),
                    )
                    .col(
                        ColumnDef::new(FarmerCommissionHistory::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .from(
                                FarmerCommissionHistory::Table,
                                FarmerCommissionHistory::FarmerId,
                            )
                            .to(Farmers::Table, Farmers::FarmerId)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(
                Table::drop()
                    .table(FarmerCommissionHistory::Table)
                    .to_owned(),
            )
            .await
    }
}

#[derive(Iden)]
enum FarmerCommissionHistory {
    Table,
    Id,
    FarmerId,
    CommissionAmount,
    Description,
    CreatedAt,
}
