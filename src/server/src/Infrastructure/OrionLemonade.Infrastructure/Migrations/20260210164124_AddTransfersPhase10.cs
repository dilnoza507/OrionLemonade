using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace OrionLemonade.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTransfersPhase10 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Transfers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TransferNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SenderBranchId = table.Column<int>(type: "integer", nullable: false),
                    ReceiverBranchId = table.Column<int>(type: "integer", nullable: false),
                    TransferType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    SentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReceivedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SentByUserId = table.Column<int>(type: "integer", nullable: true),
                    ReceivedByUserId = table.Column<int>(type: "integer", nullable: true),
                    Comment = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transfers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transfers_Branches_ReceiverBranchId",
                        column: x => x.ReceiverBranchId,
                        principalTable: "Branches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Transfers_Branches_SenderBranchId",
                        column: x => x.SenderBranchId,
                        principalTable: "Branches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Transfers_Users_ReceivedByUserId",
                        column: x => x.ReceivedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Transfers_Users_SentByUserId",
                        column: x => x.SentByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "TransferItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TransferId = table.Column<int>(type: "integer", nullable: false),
                    ItemId = table.Column<int>(type: "integer", nullable: false),
                    ItemType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    QuantitySent = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    QuantityReceived = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    Discrepancy = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    TransferPriceUsd = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransferItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransferItems_Ingredients_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Ingredients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TransferItems_Recipes_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Recipes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TransferItems_Transfers_TransferId",
                        column: x => x.TransferId,
                        principalTable: "Transfers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TransferItems_ItemId",
                table: "TransferItems",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_TransferItems_TransferId_ItemId",
                table: "TransferItems",
                columns: new[] { "TransferId", "ItemId" });

            migrationBuilder.CreateIndex(
                name: "IX_Transfers_CreatedDate",
                table: "Transfers",
                column: "CreatedDate");

            migrationBuilder.CreateIndex(
                name: "IX_Transfers_ReceivedByUserId",
                table: "Transfers",
                column: "ReceivedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Transfers_ReceiverBranchId",
                table: "Transfers",
                column: "ReceiverBranchId");

            migrationBuilder.CreateIndex(
                name: "IX_Transfers_SenderBranchId_ReceiverBranchId",
                table: "Transfers",
                columns: new[] { "SenderBranchId", "ReceiverBranchId" });

            migrationBuilder.CreateIndex(
                name: "IX_Transfers_SentByUserId",
                table: "Transfers",
                column: "SentByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Transfers_TransferNumber",
                table: "Transfers",
                column: "TransferNumber",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TransferItems");

            migrationBuilder.DropTable(
                name: "Transfers");
        }
    }
}
