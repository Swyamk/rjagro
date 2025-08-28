use crate::m20250810_161418_iteration1::Users;
use sea_orm_migration::prelude::extension::postgres::Type;
use sea_orm_migration::prelude::*;
use sea_orm_migration::schema::*;

/// Migration for financials: ledger_accounts + ledger_entries
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
        // ledger_accounts
        // -------------------
        manager
            .create_table(
                Table::create()
                    .table(LedgerAccounts::Table)
                    .if_not_exists()
                    .col(pk_auto(LedgerAccounts::AccountId))
                    .col(string_len(LedgerAccounts::Name, 150).not_null())
                    .col(
                        ColumnDef::new(LedgerAccounts::AccountType)
                            .custom(LedgerAccountType::Table)
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(LedgerAccounts::CurrentBalance)
                            .decimal_len(18, 2)
                            .not_null()
                            .default("0.00"),
                    )
                    .col(
                        timestamp_with_time_zone(LedgerAccounts::CreatedAt)
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await?;

        // unique index on account name
        manager
            .create_index(
                Index::create()
                    .name("idx_unique_ledger_accounts_name")
                    .table(LedgerAccounts::Table)
                    .col(LedgerAccounts::Name)
                    .unique()
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
                    // reference to ledger_accounts
                    .col(integer(LedgerEntries::AccountId).not_null())
                    .col(
                        ColumnDef::new(LedgerEntries::Debit)
                            .decimal_len(18, 2)
                            .null(),
                    )
                    .col(
                        ColumnDef::new(LedgerEntries::Credit)
                            .decimal_len(18, 2)
                            .null(),
                    )
                    .col(date(LedgerEntries::TxnDate).not_null())
                    .col(
                        ColumnDef::new(LedgerEntries::ReferenceTable)
                            .string_len(100)
                            .null(),
                    )
                    .col(ColumnDef::new(LedgerEntries::ReferenceId).integer().null())
                    .col(ColumnDef::new(LedgerEntries::Narration).text().null())
                    .col(ColumnDef::new(LedgerEntries::TxnGroupId).uuid().not_null())
                    .col(
                        timestamp_with_time_zone(LedgerEntries::CreatedAt)
                            .default(Expr::current_timestamp()),
                    )
                    .col(integer(LedgerEntries::CreatedBy))
                    // foreign keys
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_ledger_entries_account")
                            .from(LedgerEntries::Table, LedgerEntries::AccountId)
                            .to(LedgerAccounts::Table, LedgerAccounts::AccountId)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_ledger_entries_created_by")
                            .from(LedgerEntries::Table, LedgerEntries::CreatedBy)
                            .to(Users::Table, Users::UserId)
                            .on_update(ForeignKeyAction::Cascade)
                            .on_delete(ForeignKeyAction::SetNull),
                    )
                    .to_owned(),
            )
            .await?;

        // useful index: lookup entries by account quickly
        manager
            .create_index(
                Index::create()
                    .name("idx_ledger_entries_account_id")
                    .table(LedgerEntries::Table)
                    .col(LedgerEntries::AccountId)
                    .to_owned(),
            )
            .await?;

        // index for txn_group_id to fetch paired entries fast
        manager
            .create_index(
                Index::create()
                    .name("idx_ledger_entries_txn_group_id")
                    .table(LedgerEntries::Table)
                    .col(LedgerEntries::TxnGroupId)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // drop in reverse order of creation
        manager
            .drop_index(
                Index::drop()
                    .name("idx_ledger_entries_txn_group_id")
                    .table(LedgerEntries::Table)
                    .to_owned(),
            )
            .await
            .ok();
        manager
            .drop_index(
                Index::drop()
                    .name("idx_ledger_entries_account_id")
                    .table(LedgerEntries::Table)
                    .to_owned(),
            )
            .await
            .ok();
        manager
            .drop_table(Table::drop().table(LedgerEntries::Table).to_owned())
            .await
            .ok();

        manager
            .drop_index(
                Index::drop()
                    .name("idx_unique_ledger_accounts_name")
                    .table(LedgerAccounts::Table)
                    .to_owned(),
            )
            .await
            .ok();
        manager
            .drop_table(Table::drop().table(LedgerAccounts::Table).to_owned())
            .await
            .ok();

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
enum LedgerAccounts {
    Table,
    AccountId,
    Name,
    AccountType,
    CurrentBalance, // ✅ added here
    CreatedAt,
}

#[derive(DeriveIden)]
enum LedgerEntries {
    Table,
    EntryId,
    AccountId,
    Debit,
    Credit,
    TxnDate,
    ReferenceTable,
    ReferenceId,
    Narration,
    TxnGroupId,
    CreatedAt,
    CreatedBy,
}
