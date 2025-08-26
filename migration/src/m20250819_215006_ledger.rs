use crate::m20250810_161418_iteration1::Users;
use sea_orm_migration::prelude::extension::postgres::Type;
use sea_orm_migration::prelude::*;
use sea_orm_migration::schema::*;
/// Migration for financials: ledger_entries only
#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // -------------------
        // Enums
        // -------------------
        manager
            .create_type(
                Type::create()
                    .as_enum(LedgerAccountType::Table)
                    .values([
                        LedgerAccountType::Asset,
                        LedgerAccountType::Liability,
                        LedgerAccountType::Equity,
                        LedgerAccountType::Revenue,
                        LedgerAccountType::Expense,
                    ])
                    .to_owned(),
            )
            .await?;

        // -------------------
        // ledger_entries
        // -------------------
        manager
            .create_table(
                Table::create()
                    .table(LedgerEntries::Table)
                    .if_not_exists()
                    .col(pk_auto(LedgerEntries::EntryId))
                    .col(
                        ColumnDef::new(LedgerEntries::TransactionType)
                            .custom(LedgerAccountType::Table)
                            .not_null(),
                    )
                    .col(decimal_len(LedgerEntries::Debit, 18, 2).null())
                    .col(decimal_len(LedgerEntries::Credit, 18, 2).null())
                    .col(date(LedgerEntries::TxnDate).not_null())
                    .col(string_len(LedgerEntries::ReferenceTable, 100).null())
                    .col(integer(LedgerEntries::ReferenceId).null())
                    .col(text(LedgerEntries::Narration).null())
                    .col(
                        timestamp_with_time_zone(LedgerEntries::CreatedAt)
                            .default(Expr::current_timestamp()),
                    )
                    .col(integer(LedgerEntries::CreatedBy))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_ledger_entries_created_by")
                            .from(LedgerEntries::Table, LedgerEntries::CreatedBy)
                            .to(Users::Table, Users::UserId),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(LedgerEntries::Table).to_owned())
            .await?;
        manager
            .drop_type(Type::drop().name(LedgerAccountType::Table).to_owned())
            .await?;
        Ok(())
    }
}

// -----------------------------
// Iden enums
// -----------------------------
#[derive(DeriveIden)]
enum LedgerAccountType {
    Table,
    Asset,
    Liability,
    Equity,
    Revenue,
    Expense,
}

#[derive(DeriveIden)]
enum LedgerEntries {
    Table,
    EntryId,
    TransactionType,
    Debit,
    Credit,
    TxnDate,
    ReferenceTable,
    ReferenceId,
    Narration,
    CreatedAt,
    CreatedBy,
}
