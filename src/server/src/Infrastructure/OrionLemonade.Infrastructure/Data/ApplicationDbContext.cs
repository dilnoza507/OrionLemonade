using Microsoft.EntityFrameworkCore;
using OrionLemonade.Domain.Entities;

namespace OrionLemonade.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Item> Items => Set<Item>();
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserBranch> UserBranches => Set<UserBranch>();
    public DbSet<ExchangeRate> ExchangeRates => Set<ExchangeRate>();
    public DbSet<Ingredient> Ingredients => Set<Ingredient>();
    public DbSet<ExpenseCategory> ExpenseCategories => Set<ExpenseCategory>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Recipe> Recipes => Set<Recipe>();
    public DbSet<RecipeVersion> RecipeVersions => Set<RecipeVersion>();
    public DbSet<RecipeIngredient> RecipeIngredients => Set<RecipeIngredient>();
    public DbSet<RecipePackaging> RecipePackagings => Set<RecipePackaging>();
    public DbSet<IngredientStock> IngredientStocks => Set<IngredientStock>();
    public DbSet<IngredientReceipt> IngredientReceipts => Set<IngredientReceipt>();
    public DbSet<IngredientWriteOff> IngredientWriteOffs => Set<IngredientWriteOff>();
    public DbSet<IngredientMovement> IngredientMovements => Set<IngredientMovement>();
    public DbSet<ProductionBatch> ProductionBatches => Set<ProductionBatch>();
    public DbSet<BatchIngredientConsumption> BatchIngredientConsumptions => Set<BatchIngredientConsumption>();
    public DbSet<ProductStock> ProductStocks => Set<ProductStock>();
    public DbSet<ProductMovement> ProductMovements => Set<ProductMovement>();
    public DbSet<PriceList> PriceLists => Set<PriceList>();
    public DbSet<PriceListItem> PriceListItems => Set<PriceListItem>();
    public DbSet<Sale> Sales => Set<Sale>();
    public DbSet<SaleItem> SaleItems => Set<SaleItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<SaleReturn> SaleReturns => Set<SaleReturn>();
    public DbSet<SaleReturnItem> SaleReturnItems => Set<SaleReturnItem>();
    public DbSet<Transfer> Transfers => Set<Transfer>();
    public DbSet<TransferItem> TransferItems => Set<TransferItem>();
    public DbSet<Inventory> Inventories => Set<Inventory>();
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();
    public DbSet<Timesheet> Timesheets => Set<Timesheet>();
    public DbSet<Bonus> Bonuses => Set<Bonus>();
    public DbSet<Advance> Advances => Set<Advance>();
    public DbSet<PayrollCalculation> PayrollCalculations => Set<PayrollCalculation>();
    public DbSet<PayrollItem> PayrollItems => Set<PayrollItem>();
    public DbSet<EmployeeRateHistory> EmployeeRateHistories => Set<EmployeeRateHistory>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Item>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Price).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Branch>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(10);
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Login).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.Login).IsUnique();
            entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Role).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.Scope).HasConversion<string>().HasMaxLength(20);
        });

        modelBuilder.Entity<UserBranch>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.UserId, e.BranchId }).IsUnique();

            entity.HasOne(e => e.User)
                .WithMany(u => u.UserBranches)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Branch)
                .WithMany()
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ExchangeRate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Rate).HasPrecision(18, 4);
            entity.Property(e => e.CurrencyPair).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.Source).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(e => e.RateDate);

            entity.HasOne(e => e.SetByUser)
                .WithMany()
                .HasForeignKey(e => e.SetByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Ingredient>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Category).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.Subcategory).HasMaxLength(100);
            entity.Property(e => e.BaseUnit).HasConversion<string>().HasMaxLength(10);
            entity.Property(e => e.PurchaseUnit).HasMaxLength(50);
            entity.Property(e => e.ConversionRate).HasPrecision(18, 4);
            entity.Property(e => e.MinStock).HasPrecision(18, 4);
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.Category);
        });

        modelBuilder.Entity<ExpenseCategory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.HasIndex(e => e.Name);
        });

        modelBuilder.Entity<Client>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ContactPerson).HasMaxLength(200);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(e => e.Name);
        });

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Position).HasMaxLength(100);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.DailyRate).HasPrecision(18, 2);
            entity.Property(e => e.MonthlyRate).HasPrecision(18, 2);
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(e => e.FullName);

            entity.HasOne(e => e.Branch)
                .WithMany()
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Supplier>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ContactPerson).HasMaxLength(200);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(e => e.Name);
        });

        modelBuilder.Entity<Recipe>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.ProductName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.OutputVolume).HasPrecision(18, 4);
            entity.Property(e => e.OutputUnit).HasConversion<string>().HasMaxLength(10);
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(e => e.Name);
        });

        modelBuilder.Entity<RecipeVersion>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.HasIndex(e => new { e.RecipeId, e.VersionNumber }).IsUnique();

            entity.HasOne(e => e.Recipe)
                .WithMany(r => r.Versions)
                .HasForeignKey(e => e.RecipeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<RecipeIngredient>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Quantity).HasPrecision(18, 4);
            entity.Property(e => e.Unit).HasConversion<string>().HasMaxLength(10);

            entity.HasOne(e => e.RecipeVersion)
                .WithMany(v => v.Ingredients)
                .HasForeignKey(e => e.RecipeVersionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Ingredient)
                .WithMany()
                .HasForeignKey(e => e.IngredientId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<RecipePackaging>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Quantity).HasPrecision(18, 4);
            entity.Property(e => e.Unit).HasConversion<string>().HasMaxLength(10);

            entity.HasOne(e => e.RecipeVersion)
                .WithMany(v => v.Packaging)
                .HasForeignKey(e => e.RecipeVersionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Ingredient)
                .WithMany()
                .HasForeignKey(e => e.IngredientId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<IngredientStock>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Quantity).HasPrecision(18, 4);
            entity.Property(e => e.Unit).HasConversion<string>().HasMaxLength(10);
            entity.HasIndex(e => new { e.BranchId, e.IngredientId }).IsUnique();

            entity.HasOne(e => e.Branch)
                .WithMany()
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Ingredient)
                .WithMany()
                .HasForeignKey(e => e.IngredientId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<IngredientReceipt>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Quantity).HasPrecision(18, 4);
            entity.Property(e => e.Unit).HasConversion<string>().HasMaxLength(10);
            entity.Property(e => e.UnitPrice).HasPrecision(18, 4);
            entity.Property(e => e.TotalPrice).HasPrecision(18, 2);
            entity.Property(e => e.Currency).HasConversion<string>().HasMaxLength(10);
            entity.Property(e => e.DocumentNumber).HasMaxLength(100);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.HasIndex(e => e.ReceiptDate);

            entity.HasOne(e => e.Branch)
                .WithMany()
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Ingredient)
                .WithMany()
                .HasForeignKey(e => e.IngredientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Supplier)
                .WithMany()
                .HasForeignKey(e => e.SupplierId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<IngredientWriteOff>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Quantity).HasPrecision(18, 4);
            entity.Property(e => e.Unit).HasConversion<string>().HasMaxLength(10);
            entity.Property(e => e.Reason).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.HasIndex(e => e.WriteOffDate);

            entity.HasOne(e => e.Branch)
                .WithMany()
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Ingredient)
                .WithMany()
                .HasForeignKey(e => e.IngredientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<IngredientMovement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.MovementType).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.Quantity).HasPrecision(18, 4);
            entity.Property(e => e.Unit).HasConversion<string>().HasMaxLength(10);
            entity.Property(e => e.BalanceAfter).HasPrecision(18, 4);
            entity.Property(e => e.ReferenceType).HasMaxLength(50);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.HasIndex(e => e.MovementDate);
            entity.HasIndex(e => new { e.BranchId, e.IngredientId });

            entity.HasOne(e => e.Branch)
                .WithMany()
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Ingredient)
                .WithMany()
                .HasForeignKey(e => e.IngredientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<ProductionBatch>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.BatchNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.PlannedQuantity).HasPrecision(18, 4);
            entity.Property(e => e.ActualQuantity).HasPrecision(18, 4);
            entity.Property(e => e.OutputUnit).HasConversion<string>().HasMaxLength(10);
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.HasIndex(e => e.BatchNumber).IsUnique();
            entity.HasIndex(e => e.PlannedDate);
            entity.HasIndex(e => e.Status);

            entity.HasOne(e => e.Recipe)
                .WithMany()
                .HasForeignKey(e => e.RecipeId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.RecipeVersion)
                .WithMany()
                .HasForeignKey(e => e.RecipeVersionId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Branch)
                .WithMany()
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<BatchIngredientConsumption>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PlannedQuantity).HasPrecision(18, 4);
            entity.Property(e => e.ActualQuantity).HasPrecision(18, 4);
            entity.Property(e => e.Unit).HasConversion<string>().HasMaxLength(10);
            entity.HasIndex(e => new { e.ProductionBatchId, e.IngredientId }).IsUnique();

            entity.HasOne(e => e.ProductionBatch)
                .WithMany(b => b.IngredientConsumptions)
                .HasForeignKey(e => e.ProductionBatchId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Ingredient)
                .WithMany()
                .HasForeignKey(e => e.IngredientId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ProductStock>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Quantity);
            entity.Property(e => e.UnitCostUsd).HasPrecision(18, 4);
            entity.Property(e => e.UnitCostTjs).HasPrecision(18, 4);
            entity.Property(e => e.ExchangeRate).HasPrecision(18, 4);
            entity.HasIndex(e => new { e.BranchId, e.RecipeId });
            entity.HasIndex(e => e.ProductionDate);

            entity.HasOne(e => e.Branch)
                .WithMany()
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Recipe)
                .WithMany()
                .HasForeignKey(e => e.RecipeId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ProductionBatch)
                .WithMany()
                .HasForeignKey(e => e.ProductionBatchId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<ProductMovement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OperationType).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.Quantity);
            entity.Property(e => e.BalanceAfter);
            entity.Property(e => e.DocumentType).HasMaxLength(50);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.HasIndex(e => e.MovementDate);
            entity.HasIndex(e => new { e.BranchId, e.RecipeId });

            entity.HasOne(e => e.Branch)
                .WithMany()
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Recipe)
                .WithMany()
                .HasForeignKey(e => e.RecipeId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ProductionBatch)
                .WithMany()
                .HasForeignKey(e => e.ProductionBatchId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<PriceList>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.ListType).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(e => e.Name);

            entity.HasOne(e => e.Branch)
                .WithMany()
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<PriceListItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PriceTjs).HasPrecision(18, 2);
            entity.HasIndex(e => new { e.PriceListId, e.RecipeId }).IsUnique();

            entity.HasOne(e => e.PriceList)
                .WithMany(p => p.Items)
                .HasForeignKey(e => e.PriceListId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Recipe)
                .WithMany()
                .HasForeignKey(e => e.RecipeId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Sale>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SaleNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.PaymentMethod).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.PaymentStatus).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.TotalTjs).HasPrecision(18, 2);
            entity.Property(e => e.PaidTjs).HasPrecision(18, 2);
            entity.Property(e => e.DebtTjs).HasPrecision(18, 2);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.HasIndex(e => e.SaleNumber).IsUnique();
            entity.HasIndex(e => e.SaleDate);
            entity.HasIndex(e => e.Status);

            entity.HasOne(e => e.Branch)
                .WithMany()
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Client)
                .WithMany()
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<SaleItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UnitPriceTjs).HasPrecision(18, 2);
            entity.Property(e => e.TotalTjs).HasPrecision(18, 2);
            entity.Property(e => e.UnitCostUsd).HasPrecision(18, 4);
            entity.Property(e => e.UnitCostTjs).HasPrecision(18, 4);
            entity.Property(e => e.ExchangeRate).HasPrecision(18, 4);

            entity.HasOne(e => e.Sale)
                .WithMany(s => s.Items)
                .HasForeignKey(e => e.SaleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Recipe)
                .WithMany()
                .HasForeignKey(e => e.RecipeId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AmountTjs).HasPrecision(18, 2);
            entity.Property(e => e.Method).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.HasIndex(e => e.PaymentDate);

            entity.HasOne(e => e.Sale)
                .WithMany(s => s.Payments)
                .HasForeignKey(e => e.SaleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Expense>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AmountOriginal).HasPrecision(18, 2);
            entity.Property(e => e.ExchangeRate).HasPrecision(18, 4);
            entity.Property(e => e.AmountTjs).HasPrecision(18, 2);
            entity.Property(e => e.Currency).HasConversion<string>().HasMaxLength(10);
            entity.Property(e => e.Comment).HasMaxLength(1000);
            entity.Property(e => e.RecurrencePeriod).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.Source).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(e => e.ExpenseDate);
            entity.HasIndex(e => new { e.BranchId, e.CategoryId });

            entity.HasOne(e => e.Branch)
                .WithMany()
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Category)
                .WithMany(c => c.Expenses)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<SaleReturn>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ReturnNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Reason).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.Comment).HasMaxLength(1000);
            entity.HasIndex(e => e.ReturnNumber).IsUnique();
            entity.HasIndex(e => e.ReturnDate);
            entity.HasIndex(e => new { e.BranchId, e.ClientId });

            entity.HasOne(e => e.Branch)
                .WithMany()
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Sale)
                .WithMany()
                .HasForeignKey(e => e.SaleId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Client)
                .WithMany()
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<SaleReturnItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.ReturnId, e.RecipeId });

            entity.HasOne(e => e.Return)
                .WithMany(r => r.Items)
                .HasForeignKey(e => e.ReturnId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Recipe)
                .WithMany()
                .HasForeignKey(e => e.RecipeId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Transfer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TransferNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.TransferType).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.Comment).HasMaxLength(1000);
            entity.HasIndex(e => e.TransferNumber).IsUnique();
            entity.HasIndex(e => e.CreatedDate);
            entity.HasIndex(e => new { e.SenderBranchId, e.ReceiverBranchId });

            entity.HasOne(e => e.SenderBranch)
                .WithMany()
                .HasForeignKey(e => e.SenderBranchId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ReceiverBranch)
                .WithMany()
                .HasForeignKey(e => e.ReceiverBranchId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.SentByUser)
                .WithMany()
                .HasForeignKey(e => e.SentByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.ReceivedByUser)
                .WithMany()
                .HasForeignKey(e => e.ReceivedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<TransferItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ItemType).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.QuantitySent).HasPrecision(18, 4);
            entity.Property(e => e.QuantityReceived).HasPrecision(18, 4);
            entity.Property(e => e.Discrepancy).HasPrecision(18, 4);
            entity.Property(e => e.TransferPriceUsd).HasPrecision(18, 2);
            entity.HasIndex(e => new { e.TransferId, e.ItemId });

            entity.HasOne(e => e.Transfer)
                .WithMany(t => t.Items)
                .HasForeignKey(e => e.TransferId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Ingredient)
                .WithMany()
                .HasForeignKey(e => e.ItemId)
                .HasPrincipalKey(i => i.Id)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            entity.HasOne(e => e.Recipe)
                .WithMany()
                .HasForeignKey(e => e.ItemId)
                .HasPrincipalKey(r => r.Id)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);
        });

        modelBuilder.Entity<Inventory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.InventoryNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.InventoryType).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.Comment).HasMaxLength(1000);
            entity.HasIndex(e => e.InventoryNumber).IsUnique();
            entity.HasIndex(e => e.InventoryDate);
            entity.HasIndex(e => new { e.BranchId, e.Status });

            entity.HasOne(e => e.Branch)
                .WithMany()
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.StartedByUser)
                .WithMany()
                .HasForeignKey(e => e.StartedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.CompletedByUser)
                .WithMany()
                .HasForeignKey(e => e.CompletedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<InventoryItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ItemType).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.ExpectedQuantity).HasPrecision(18, 4);
            entity.Property(e => e.ActualQuantity).HasPrecision(18, 4);
            entity.Property(e => e.Discrepancy).HasPrecision(18, 4);
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.HasIndex(e => new { e.InventoryId, e.ItemId });

            entity.HasOne(e => e.Inventory)
                .WithMany(i => i.Items)
                .HasForeignKey(e => e.InventoryId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Ingredient)
                .WithMany()
                .HasForeignKey(e => e.ItemId)
                .HasPrincipalKey(i => i.Id)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            entity.HasOne(e => e.Recipe)
                .WithMany()
                .HasForeignKey(e => e.ItemId)
                .HasPrincipalKey(r => r.Id)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);
        });

        modelBuilder.Entity<Timesheet>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.HoursWorked).HasPrecision(5, 2);
            entity.Property(e => e.OvertimeHours).HasPrecision(5, 2);
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.HasIndex(e => new { e.EmployeeId, e.WorkDate });
            entity.HasIndex(e => e.WorkDate);

            entity.HasOne(e => e.Employee)
                .WithMany()
                .HasForeignKey(e => e.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Branch)
                .WithMany()
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Bonus>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.BonusType).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.Reason).HasMaxLength(500);
            entity.HasIndex(e => new { e.EmployeeId, e.BonusDate });
            entity.HasIndex(e => e.BonusDate);

            entity.HasOne(e => e.Employee)
                .WithMany()
                .HasForeignKey(e => e.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Advance>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.HasIndex(e => new { e.EmployeeId, e.AdvanceDate });
            entity.HasIndex(e => e.AdvanceDate);

            entity.HasOne(e => e.Employee)
                .WithMany()
                .HasForeignKey(e => e.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<PayrollCalculation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.BaseSalary).HasPrecision(18, 2);
            entity.Property(e => e.DailyPayTotal).HasPrecision(18, 2);
            entity.Property(e => e.BonusTotal).HasPrecision(18, 2);
            entity.Property(e => e.PenaltyTotal).HasPrecision(18, 2);
            entity.Property(e => e.AdvanceTotal).HasPrecision(18, 2);
            entity.Property(e => e.GrossTotal).HasPrecision(18, 2);
            entity.Property(e => e.NetTotal).HasPrecision(18, 2);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.HasIndex(e => new { e.EmployeeId, e.Year, e.Month }).IsUnique();
            entity.HasIndex(e => new { e.BranchId, e.Year, e.Month });
            entity.HasIndex(e => e.Status);

            entity.HasOne(e => e.Employee)
                .WithMany()
                .HasForeignKey(e => e.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Branch)
                .WithMany()
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.CalculatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CalculatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.ApprovedByUser)
                .WithMany()
                .HasForeignKey(e => e.ApprovedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<PayrollItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ItemType).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Quantity).HasPrecision(18, 4);
            entity.Property(e => e.Rate).HasPrecision(18, 4);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.ReferenceType).HasMaxLength(50);
            entity.HasIndex(e => e.PayrollCalculationId);

            entity.HasOne(e => e.PayrollCalculation)
                .WithMany(p => p.Items)
                .HasForeignKey(e => e.PayrollCalculationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<EmployeeRateHistory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DailyRate).HasPrecision(18, 2);
            entity.Property(e => e.MonthlyRate).HasPrecision(18, 2);
            entity.Property(e => e.Reason).HasMaxLength(500);
            entity.HasIndex(e => new { e.EmployeeId, e.EffectiveDate });

            entity.HasOne(e => e.Employee)
                .WithMany()
                .HasForeignKey(e => e.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.SetByUser)
                .WithMany()
                .HasForeignKey(e => e.SetByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Type).HasConversion<string>().HasMaxLength(30);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Message).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.RelatedEntityType).HasMaxLength(50);
            entity.HasIndex(e => new { e.UserId, e.IsRead });
            entity.HasIndex(e => e.CreatedAt);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Branch)
                .WithMany()
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
