using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace OrionLemonade.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProductionBatch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProductionBatches",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BatchNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RecipeId = table.Column<int>(type: "integer", nullable: false),
                    RecipeVersionId = table.Column<int>(type: "integer", nullable: false),
                    BranchId = table.Column<int>(type: "integer", nullable: false),
                    PlannedQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    ActualQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    OutputUnit = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    PlannedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedByUserId = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductionBatches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductionBatches_Branches_BranchId",
                        column: x => x.BranchId,
                        principalTable: "Branches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductionBatches_RecipeVersions_RecipeVersionId",
                        column: x => x.RecipeVersionId,
                        principalTable: "RecipeVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductionBatches_Recipes_RecipeId",
                        column: x => x.RecipeId,
                        principalTable: "Recipes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductionBatches_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "BatchIngredientConsumptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductionBatchId = table.Column<int>(type: "integer", nullable: false),
                    IngredientId = table.Column<int>(type: "integer", nullable: false),
                    PlannedQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    ActualQuantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    Unit = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BatchIngredientConsumptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BatchIngredientConsumptions_Ingredients_IngredientId",
                        column: x => x.IngredientId,
                        principalTable: "Ingredients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BatchIngredientConsumptions_ProductionBatches_ProductionBat~",
                        column: x => x.ProductionBatchId,
                        principalTable: "ProductionBatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BatchIngredientConsumptions_IngredientId",
                table: "BatchIngredientConsumptions",
                column: "IngredientId");

            migrationBuilder.CreateIndex(
                name: "IX_BatchIngredientConsumptions_ProductionBatchId_IngredientId",
                table: "BatchIngredientConsumptions",
                columns: new[] { "ProductionBatchId", "IngredientId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatches_BatchNumber",
                table: "ProductionBatches",
                column: "BatchNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatches_BranchId",
                table: "ProductionBatches",
                column: "BranchId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatches_CreatedByUserId",
                table: "ProductionBatches",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatches_PlannedDate",
                table: "ProductionBatches",
                column: "PlannedDate");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatches_RecipeId",
                table: "ProductionBatches",
                column: "RecipeId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatches_RecipeVersionId",
                table: "ProductionBatches",
                column: "RecipeVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatches_Status",
                table: "ProductionBatches",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BatchIngredientConsumptions");

            migrationBuilder.DropTable(
                name: "ProductionBatches");
        }
    }
}
