using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrionLemonade.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameHourlyToDailyRate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "HourlyPayTotal",
                table: "PayrollCalculations",
                newName: "DailyPayTotal");

            migrationBuilder.RenameColumn(
                name: "HourlyRate",
                table: "Employees",
                newName: "DailyRate");

            migrationBuilder.RenameColumn(
                name: "HourlyRate",
                table: "EmployeeRateHistories",
                newName: "DailyRate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DailyPayTotal",
                table: "PayrollCalculations",
                newName: "HourlyPayTotal");

            migrationBuilder.RenameColumn(
                name: "DailyRate",
                table: "Employees",
                newName: "HourlyRate");

            migrationBuilder.RenameColumn(
                name: "DailyRate",
                table: "EmployeeRateHistories",
                newName: "HourlyRate");
        }
    }
}
