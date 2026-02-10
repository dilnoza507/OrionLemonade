using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace OrionLemonade.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProductStockAndMovement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProductMovements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MovementDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    BranchId = table.Column<int>(type: "integer", nullable: false),
                    RecipeId = table.Column<int>(type: "integer", nullable: false),
                    ProductionBatchId = table.Column<int>(type: "integer", nullable: true),
                    OperationType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    BalanceAfter = table.Column<int>(type: "integer", nullable: false),
                    DocumentType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DocumentId = table.Column<int>(type: "integer", nullable: true),
                    UserId = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductMovements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductMovements_Branches_BranchId",
                        column: x => x.BranchId,
                        principalTable: "Branches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductMovements_ProductionBatches_ProductionBatchId",
                        column: x => x.ProductionBatchId,
                        principalTable: "ProductionBatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ProductMovements_Recipes_RecipeId",
                        column: x => x.RecipeId,
                        principalTable: "Recipes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductMovements_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ProductStocks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BranchId = table.Column<int>(type: "integer", nullable: false),
                    RecipeId = table.Column<int>(type: "integer", nullable: false),
                    ProductionBatchId = table.Column<int>(type: "integer", nullable: true),
                    ProductionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitCostUsd = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    UnitCostTjs = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    ExchangeRate = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductStocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductStocks_Branches_BranchId",
                        column: x => x.BranchId,
                        principalTable: "Branches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductStocks_ProductionBatches_ProductionBatchId",
                        column: x => x.ProductionBatchId,
                        principalTable: "ProductionBatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ProductStocks_Recipes_RecipeId",
                        column: x => x.RecipeId,
                        principalTable: "Recipes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductMovements_BranchId_RecipeId",
                table: "ProductMovements",
                columns: new[] { "BranchId", "RecipeId" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductMovements_MovementDate",
                table: "ProductMovements",
                column: "MovementDate");

            migrationBuilder.CreateIndex(
                name: "IX_ProductMovements_ProductionBatchId",
                table: "ProductMovements",
                column: "ProductionBatchId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductMovements_RecipeId",
                table: "ProductMovements",
                column: "RecipeId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductMovements_UserId",
                table: "ProductMovements",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductStocks_BranchId_RecipeId",
                table: "ProductStocks",
                columns: new[] { "BranchId", "RecipeId" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductStocks_ProductionBatchId",
                table: "ProductStocks",
                column: "ProductionBatchId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductStocks_ProductionDate",
                table: "ProductStocks",
                column: "ProductionDate");

            migrationBuilder.CreateIndex(
                name: "IX_ProductStocks_RecipeId",
                table: "ProductStocks",
                column: "RecipeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductMovements");

            migrationBuilder.DropTable(
                name: "ProductStocks");
        }
    }
}
