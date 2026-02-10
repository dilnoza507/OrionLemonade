using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace OrionLemonade.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddExpensesPhase9 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Expenses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BranchId = table.Column<int>(type: "integer", nullable: true),
                    ExpenseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CategoryId = table.Column<int>(type: "integer", nullable: false),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    AmountOriginal = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ExchangeRate = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    AmountTjs = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Comment = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IsRecurring = table.Column<bool>(type: "boolean", nullable: false),
                    RecurrencePeriod = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Source = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    SourceDocumentId = table.Column<int>(type: "integer", nullable: true),
                    CreatedByUserId = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Expenses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Expenses_Branches_BranchId",
                        column: x => x.BranchId,
                        principalTable: "Branches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Expenses_ExpenseCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "ExpenseCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Expenses_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_BranchId_CategoryId",
                table: "Expenses",
                columns: new[] { "BranchId", "CategoryId" });

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_CategoryId",
                table: "Expenses",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_CreatedByUserId",
                table: "Expenses",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_ExpenseDate",
                table: "Expenses",
                column: "ExpenseDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Expenses");
        }
    }
}
