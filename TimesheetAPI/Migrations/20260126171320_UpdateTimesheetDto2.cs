using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimesheetAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTimesheetDto2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Timesheets_UserId_ProjectId_WeekStartDate_WeekEndDate",
                table: "Timesheets");

            migrationBuilder.DropColumn(
                name: "TotalHoursWorked",
                table: "Timesheets");

            migrationBuilder.DropColumn(
                name: "WeekEndDate",
                table: "Timesheets");

            migrationBuilder.DropColumn(
                name: "WeekStartDate",
                table: "Timesheets");

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 26, 17, 13, 19, 916, DateTimeKind.Utc).AddTicks(1899));

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 26, 17, 13, 19, 916, DateTimeKind.Utc).AddTicks(1901));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 26, 17, 13, 19, 916, DateTimeKind.Utc).AddTicks(1763));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 26, 17, 13, 19, 916, DateTimeKind.Utc).AddTicks(1766));

            migrationBuilder.CreateIndex(
                name: "IX_Timesheets_UserId_ProjectId_Date",
                table: "Timesheets",
                columns: new[] { "UserId", "ProjectId", "Date" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Timesheets_UserId_ProjectId_Date",
                table: "Timesheets");

            migrationBuilder.AddColumn<decimal>(
                name: "TotalHoursWorked",
                table: "Timesheets",
                type: "decimal(5,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "WeekEndDate",
                table: "Timesheets",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "WeekStartDate",
                table: "Timesheets",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 26, 17, 3, 58, 561, DateTimeKind.Utc).AddTicks(2815));

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 26, 17, 3, 58, 561, DateTimeKind.Utc).AddTicks(2818));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 26, 17, 3, 58, 561, DateTimeKind.Utc).AddTicks(2682));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 26, 17, 3, 58, 561, DateTimeKind.Utc).AddTicks(2685));

            migrationBuilder.CreateIndex(
                name: "IX_Timesheets_UserId_ProjectId_WeekStartDate_WeekEndDate",
                table: "Timesheets",
                columns: new[] { "UserId", "ProjectId", "WeekStartDate", "WeekEndDate" },
                unique: true);
        }
    }
}
