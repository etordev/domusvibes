using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DomusVibes.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class HouseholdTasksAndTurns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TaskKey",
                table: "ActivityEvents",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Weight",
                table: "ActivityEvents",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "HomeTurns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HomeId = table.Column<Guid>(type: "uuid", nullable: false),
                    TaskKey = table.Column<string>(type: "text", nullable: false),
                    IntervalDays = table.Column<int>(type: "integer", nullable: false),
                    AlertDays = table.Column<int>(type: "integer", nullable: false),
                    StartsOn = table.Column<DateOnly>(type: "date", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomeTurns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HomeTurns_Homes_HomeId",
                        column: x => x.HomeId,
                        principalTable: "Homes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HomeTurnMembers",
                columns: table => new
                {
                    TurnId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomeTurnMembers", x => new { x.TurnId, x.UserId });
                    table.ForeignKey(
                        name: "FK_HomeTurnMembers_HomeTurns_TurnId",
                        column: x => x.TurnId,
                        principalTable: "HomeTurns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HomeTurns_HomeId_TaskKey",
                table: "HomeTurns",
                columns: new[] { "HomeId", "TaskKey" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HomeTurnMembers");

            migrationBuilder.DropTable(
                name: "HomeTurns");

            migrationBuilder.DropColumn(
                name: "TaskKey",
                table: "ActivityEvents");

            migrationBuilder.DropColumn(
                name: "Weight",
                table: "ActivityEvents");
        }
    }
}
