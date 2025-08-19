use sea_orm_migration::prelude::extension::postgres::Type;
use sea_orm_migration::{prelude::*, schema::*};
#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Create enum types first
        manager
            .create_type(
                Type::create()
                    .as_enum(UserRole::Table)
                    .values([UserRole::Admin, UserRole::Supervisor, UserRole::Accountant])
                    .to_owned(),
            )
            .await?;

        manager
            .create_type(
                Type::create()
                    .as_enum(PurchaseCategory::Table)
                    .values([
                        PurchaseCategory::Bird,
                        PurchaseCategory::Feed,
                        PurchaseCategory::Medicine,
                    ])
                    .to_owned(),
            )
            .await?;

        manager
            .create_type(
                Type::create()
                    .as_enum(BatchStatus::Table)
                    .values([BatchStatus::Open, BatchStatus::Closed])
                    .to_owned(),
            )
            .await?;

        manager
            .create_type(
                Type::create()
                    .as_enum(RequirementCategory::Table)
                    .values([
                        RequirementCategory::Bird,
                        RequirementCategory::Feed,
                        RequirementCategory::Medicine,
                    ])
                    .to_owned(),
            )
            .await?;

        manager
            .create_type(
                Type::create()
                    .as_enum(SupplierType::Table)
                    .values([
                        SupplierType::Feed,
                        SupplierType::Chick,
                        SupplierType::Medicine,
                    ])
                    .to_owned(),
            )
            .await?;
        manager
            .create_type(
                Type::create()
                    .as_enum(RequirementStatus::Table)
                    .values([
                        RequirementStatus::Accept,
                        RequirementStatus::Decline,
                        RequirementStatus::Pending,
                    ])
                    .to_owned(),
            )
            .await?;

        // Create users table
        manager
            .create_table(
                Table::create()
                    .table(Users::Table)
                    .if_not_exists()
                    .col(pk_auto(Users::UserId))
                    .col(string_len(Users::Name, 100).not_null())
                    .col(string_len(Users::Email, 100).not_null().unique_key())
                    .col(string_len(Users::Password, 100).not_null())
                    .col(
                        ColumnDef::new(Users::Role)
                            .custom(UserRole::Table)
                            .not_null(),
                    )
                    .col(
                        timestamp_with_time_zone(Users::CreatedAt)
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await?;

        // Create production_lines table
        manager
            .create_table(
                Table::create()
                    .table(ProductionLines::Table)
                    .if_not_exists()
                    .col(pk_auto(ProductionLines::LineId))
                    .col(string_len(ProductionLines::LineName, 100).not_null())
                    .col(integer(ProductionLines::SupervisorId).not_null())
                    .col(
                        timestamp_with_time_zone(ProductionLines::CreatedAt)
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_production_lines_supervisor")
                            .from(ProductionLines::Table, ProductionLines::SupervisorId)
                            .to(Users::Table, Users::UserId),
                    )
                    .to_owned(),
            )
            .await?;

        // Create items table
        manager
            .create_table(
                Table::create()
                    .table(Items::Table)
                    .if_not_exists()
                    .col(string_len(Items::ItemCode, 100).not_null().primary_key())
                    .col(string_len(Items::ItemName, 100).not_null())
                    .col(string_len(Items::Unit, 50))
                    .to_owned(),
            )
            .await?;

        // Create purchases table
        manager
            .create_table(
                Table::create()
                    .table(Purchases::Table)
                    .if_not_exists()
                    .col(pk_auto(Purchases::PurchaseId))
                    .col(string_len(Purchases::ItemCode, 100).not_null())
                    .col(decimal_len(Purchases::CostPerUnit, 12, 2).not_null())
                    .col(decimal_len(Purchases::TotalCost, 12, 2))
                    .col(date(Purchases::PurchaseDate).not_null())
                    .col(string_len(Purchases::Supplier, 100))
                    .col(integer(Purchases::CreatedBy))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_purchases_created_by")
                            .from(Purchases::Table, Purchases::CreatedBy)
                            .to(Users::Table, Users::UserId),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_purchases_item_code")
                            .from(Purchases::Table, Purchases::ItemCode)
                            .to(Items::Table, Items::ItemCode),
                    )
                    .to_owned(),
            )
            .await?;

        // Create farmers table
        manager
            .create_table(
                Table::create()
                    .table(Farmers::Table)
                    .if_not_exists()
                    .col(pk_auto(Farmers::FarmerId))
                    .col(string_len(Farmers::Name, 100).not_null())
                    .col(string_len(Farmers::PhoneNumber, 15).not_null().unique_key())
                    .col(text(Farmers::Address).not_null())
                    .col(string_len(Farmers::BankAccountNo, 30).not_null())
                    .col(string_len(Farmers::BankName, 100).not_null())
                    .col(string_len(Farmers::IfscCode, 15).not_null())
                    .col(decimal_len(Farmers::AreaSize, 10, 2))
                    .col(
                        timestamp_with_time_zone(Farmers::CreatedAt)
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await?;

        // Create batches table
        manager
            .create_table(
                Table::create()
                    .table(Batches::Table)
                    .if_not_exists()
                    .col(pk_auto(Batches::BatchId))
                    .col(integer(Batches::LineId).not_null())
                    .col(integer(Batches::SupervisorId).not_null())
                    .col(integer(Batches::FarmerId).not_null())
                    .col(date(Batches::StartDate).not_null())
                    .col(date(Batches::EndDate))
                    .col(integer(Batches::InitialBirdCount).not_null())
                    .col(integer(Batches::CurrentBirdCount))
                    .col(
                        ColumnDef::new(Batches::Status)
                            .custom(BatchStatus::Table)
                            .default("open"),
                    )
                    .col(
                        timestamp_with_time_zone(Batches::CreatedAt)
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_batches_line")
                            .from(Batches::Table, Batches::LineId)
                            .to(ProductionLines::Table, ProductionLines::LineId),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_batches_supervisor")
                            .from(Batches::Table, Batches::SupervisorId)
                            .to(Users::Table, Users::UserId),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_batches_farmer")
                            .from(Batches::Table, Batches::FarmerId)
                            .to(Farmers::Table, Farmers::FarmerId),
                    )
                    .to_owned(),
            )
            .await?;

        // Create batch_requirements table
        manager
            .create_table(
                Table::create()
                    .table(BatchRequirements::Table)
                    .if_not_exists()
                    .col(pk_auto(BatchRequirements::RequirementId))
                    .col(integer(BatchRequirements::BatchId).not_null())
                    .col(integer(BatchRequirements::LineId).not_null())
                    .col(integer(BatchRequirements::SupervisorId).not_null())
                    .col(string_len(BatchRequirements::ItemCode, 100).not_null())
                    .col(decimal_len(BatchRequirements::Quantity, 12, 2).not_null())
                    .col(
                        ColumnDef::new(BatchRequirements::Status)
                            .custom(RequirementStatus::Table)
                            .default("pending")
                            .not_null(),
                    )
                    .col(date(BatchRequirements::RequestDate).not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_batch_requirements_batch")
                            .from(BatchRequirements::Table, BatchRequirements::BatchId)
                            .to(Batches::Table, Batches::BatchId),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_batch_requirements_item")
                            .from(BatchRequirements::Table, BatchRequirements::ItemCode)
                            .to(Items::Table, Items::ItemCode),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_batch_requirements_line")
                            .from(BatchRequirements::Table, BatchRequirements::LineId)
                            .to(ProductionLines::Table, ProductionLines::LineId),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_batch_requirements_supervisor")
                            .from(BatchRequirements::Table, BatchRequirements::SupervisorId)
                            .to(Users::Table, Users::UserId),
                    )
                    .to_owned(),
            )
            .await?;

        // Create batch_allocations table
        manager
            .create_table(
                Table::create()
                    .table(BatchAllocations::Table)
                    .if_not_exists()
                    .col(pk_auto(BatchAllocations::AllocationId))
                    .col(integer(BatchAllocations::RequirementId).not_null())
                    .col(decimal_len(BatchAllocations::AllocatedQty, 12, 2).not_null())
                    .col(date(BatchAllocations::AllocationDate).not_null())
                    .col(integer(BatchAllocations::AllocatedBy).not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_batch_allocations_requirement")
                            .from(BatchAllocations::Table, BatchAllocations::RequirementId)
                            .to(BatchRequirements::Table, BatchRequirements::RequirementId),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_batch_allocations_user")
                            .from(BatchAllocations::Table, BatchAllocations::AllocatedBy)
                            .to(Users::Table, Users::UserId),
                    )
                    .to_owned(),
            )
            .await?;

        // Create traders table
        manager
            .create_table(
                Table::create()
                    .table(Traders::Table)
                    .if_not_exists()
                    .col(pk_auto(Traders::TraderId))
                    .col(string_len(Traders::Name, 100).not_null())
                    .col(string_len(Traders::PhoneNumber, 15).not_null().unique_key())
                    .col(text(Traders::Address).not_null())
                    .col(string_len(Traders::BankAccountNo, 30).not_null())
                    .col(string_len(Traders::BankName, 100).not_null())
                    .col(string_len(Traders::IfscCode, 15).not_null())
                    .col(string_len(Traders::Area, 100))
                    .col(
                        timestamp_with_time_zone(Traders::CreatedAt)
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await?;

        // Create suppliers table
        manager
            .create_table(
                Table::create()
                    .table(Suppliers::Table)
                    .if_not_exists()
                    .col(pk_auto(Suppliers::SupplierId))
                    .col(
                        ColumnDef::new(Suppliers::SupplierType)
                            .custom(SupplierType::Table)
                            .not_null(),
                    )
                    .col(string_len(Suppliers::Name, 100).not_null())
                    .col(
                        string_len(Suppliers::PhoneNumber, 15)
                            .not_null()
                            .unique_key(),
                    )
                    .col(text(Suppliers::Address).not_null())
                    .col(string_len(Suppliers::BankAccountNo, 30).not_null())
                    .col(string_len(Suppliers::BankName, 100).not_null())
                    .col(string_len(Suppliers::IfscCode, 15).not_null())
                    .col(
                        timestamp_with_time_zone(Suppliers::CreatedAt)
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await?;

        // Create bird_count_history table
        manager
            .create_table(
                Table::create()
                    .table(BirdCountHistory::Table)
                    .if_not_exists()
                    .col(pk_auto(BirdCountHistory::RecordId))
                    .col(integer(BirdCountHistory::BatchId).not_null())
                    .col(date(BirdCountHistory::RecordDate).not_null())
                    .col(integer(BirdCountHistory::Deaths).default(0))
                    .col(integer(BirdCountHistory::Additions).default(0))
                    .col(text(BirdCountHistory::Notes))
                    .col(
                        timestamp_with_time_zone(BirdCountHistory::CreatedAt)
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_bird_count_history_batch")
                            .from(BirdCountHistory::Table, BirdCountHistory::BatchId)
                            .to(Batches::Table, Batches::BatchId)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Create bird_sell_history table
        manager
            .create_table(
                Table::create()
                    .table(BirdSellHistory::Table)
                    .if_not_exists()
                    .col(pk_auto(BirdSellHistory::SaleId))
                    .col(integer(BirdSellHistory::BatchId).not_null())
                    .col(integer(BirdSellHistory::TraderId).not_null())
                    .col(date(BirdSellHistory::SaleDate).not_null())
                    .col(integer(BirdSellHistory::QuantitySold).not_null())
                    .col(decimal_len(BirdSellHistory::PricePerBird, 12, 2).not_null())
                    .col(decimal_len(BirdSellHistory::TotalAmount, 12, 2))
                    .col(text(BirdSellHistory::Notes))
                    .col(
                        timestamp_with_time_zone(BirdSellHistory::CreatedAt)
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_bird_sell_history_batch")
                            .from(BirdSellHistory::Table, BirdSellHistory::BatchId)
                            .to(Batches::Table, Batches::BatchId)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_bird_sell_history_trader")
                            .from(BirdSellHistory::Table, BirdSellHistory::TraderId)
                            .to(Traders::Table, Traders::TraderId),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop tables in reverse order to avoid foreign key constraint issues
        manager
            .drop_table(Table::drop().table(BirdSellHistory::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(BirdCountHistory::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(Suppliers::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(Traders::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(Farmers::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(BatchAllocations::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(BatchRequirements::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(Batches::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(Purchases::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(Items::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(ProductionLines::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(Users::Table).to_owned())
            .await?;

        // Drop enum types
        manager
            .drop_type(Type::drop().name(SupplierType::Table).to_owned())
            .await?;

        manager
            .drop_type(Type::drop().name(RequirementCategory::Table).to_owned())
            .await?;

        manager
            .drop_type(Type::drop().name(BatchStatus::Table).to_owned())
            .await?;

        manager
            .drop_type(Type::drop().name(PurchaseCategory::Table).to_owned())
            .await?;

        manager
            .drop_type(Type::drop().name(UserRole::Table).to_owned())
            .await?;

        manager
            .drop_type(Type::drop().name(RequirementStatus::Table).to_owned())
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum UserRole {
    Table,
    Admin,
    Supervisor,
    Accountant,
}

#[derive(DeriveIden)]
enum PurchaseCategory {
    Table,
    Bird,
    Feed,
    Medicine,
}

#[derive(DeriveIden)]
enum BatchStatus {
    Table,
    Open,
    Closed,
}

#[derive(DeriveIden)]
enum RequirementCategory {
    Table,
    Bird,
    Feed,
    Medicine,
}

#[derive(DeriveIden)]
enum SupplierType {
    Table,
    Feed,
    Chick,
    Medicine,
}

#[derive(DeriveIden)]
enum Users {
    Table,
    UserId,
    Name,
    Email,
    Password,
    Role,
    CreatedAt,
}

#[derive(DeriveIden)]
enum ProductionLines {
    Table,
    LineId,
    LineName,
    SupervisorId,
    CreatedAt,
}

#[derive(DeriveIden)]
enum Purchases {
    Table,
    PurchaseId,
    ItemCode,
    CostPerUnit,
    TotalCost,
    PurchaseDate,
    Supplier,
    CreatedBy,
}

#[derive(DeriveIden)]
enum Batches {
    Table,
    BatchId,
    LineId,
    SupervisorId,
    FarmerId,
    StartDate,
    EndDate,
    InitialBirdCount,
    CurrentBirdCount,
    Status,
    CreatedAt,
}

#[derive(DeriveIden)]
enum BatchRequirements {
    Table,
    RequirementId,
    BatchId,
    LineId,
    SupervisorId,
    ItemCode,
    Quantity,
    Status,
    RequestDate,
}

#[derive(DeriveIden)]
enum BatchAllocations {
    Table,
    AllocationId,
    RequirementId,
    AllocatedQty,
    AllocationDate,
    AllocatedBy,
}

#[derive(DeriveIden)]
enum Farmers {
    Table,
    FarmerId,
    Name,
    PhoneNumber,
    Address,
    BankAccountNo,
    BankName,
    IfscCode,
    AreaSize,
    CreatedAt,
}

#[derive(DeriveIden)]
enum Traders {
    Table,
    TraderId,
    Name,
    PhoneNumber,
    Address,
    BankAccountNo,
    BankName,
    IfscCode,
    Area,
    CreatedAt,
}

#[derive(DeriveIden)]
enum Suppliers {
    Table,
    SupplierId,
    SupplierType,
    Name,
    PhoneNumber,
    Address,
    BankAccountNo,
    BankName,
    IfscCode,
    CreatedAt,
}

#[derive(DeriveIden)]
enum BirdCountHistory {
    Table,
    RecordId,
    BatchId,
    RecordDate,
    Deaths,
    Additions,
    Notes,
    CreatedAt,
}

#[derive(DeriveIden)]
enum BirdSellHistory {
    Table,
    SaleId,
    BatchId,
    TraderId,
    SaleDate,
    QuantitySold,
    PricePerBird,
    TotalAmount,
    Notes,
    CreatedAt,
}
#[derive(DeriveIden)]
pub enum Items {
    Table,
    ItemCode, // string PK
    ItemName,
    Unit,
}

#[derive(DeriveIden)]
enum RequirementStatus {
    Table,
    Accept,
    Decline,
    Pending,
}
