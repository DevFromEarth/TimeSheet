using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimesheetAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTimesheetConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Timesheets_UserId_ProjectId_Date",
                table: "Timesheets");

            migrationBuilder.AlterColumn<decimal>(
                name: "TotalHoursWorked",
                table: "Timesheets",
                type: "decimal(5,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 26, 16, 33, 22, 372, DateTimeKind.Utc).AddTicks(6944));

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 26, 16, 33, 22, 372, DateTimeKind.Utc).AddTicks(6947));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 26, 16, 33, 22, 372, DateTimeKind.Utc).AddTicks(6762));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 26, 16, 33, 22, 372, DateTimeKind.Utc).AddTicks(6765));

            migrationBuilder.CreateIndex(
                name: "IX_Timesheets_UserId_ProjectId_WeekStartDate_WeekEndDate",
                table: "Timesheets",
                columns: new[] { "UserId", "ProjectId", "WeekStartDate", "WeekEndDate" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Timesheets_UserId_ProjectId_WeekStartDate_WeekEndDate",
                table: "Timesheets");

            migrationBuilder.AlterColumn<decimal>(
                name: "TotalHoursWorked",
                table: "Timesheets",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(5,2)");

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 26, 16, 28, 42, 779, DateTimeKind.Utc).AddTicks(1587));

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 26, 16, 28, 42, 779, DateTimeKind.Utc).AddTicks(1591));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 26, 16, 28, 42, 779, DateTimeKind.Utc).AddTicks(1392));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 26, 16, 28, 42, 779, DateTimeKind.Utc).AddTicks(1397));

            migrationBuilder.CreateIndex(
                name: "IX_Timesheets_UserId_ProjectId_Date",
                table: "Timesheets",
                columns: new[] { "UserId", "ProjectId", "Date" },
                unique: true);
        }
    }
}
