using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DomusVibes.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ActivityOccurredOn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "OccurredOn",
                table: "ActivityEvents",
                type: "date",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE "ActivityEvents"
                SET "OccurredOn" = ("CreatedAt" AT TIME ZONE 'UTC')::date
                """);

            migrationBuilder.AlterColumn<DateOnly>(
                name: "OccurredOn",
                table: "ActivityEvents",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateOnly),
                oldType: "date",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OccurredOn",
                table: "ActivityEvents");
        }
    }
}
