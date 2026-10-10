using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DomusVibes.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class HomeNotices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HomeNotices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HomeId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActorUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    Alert = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomeNotices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HomeNotices_Homes_HomeId",
                        column: x => x.HomeId,
                        principalTable: "Homes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HomeNoticeReceipts",
                columns: table => new
                {
                    NoticeId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReadAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomeNoticeReceipts", x => new { x.NoticeId, x.UserId });
                    table.ForeignKey(
                        name: "FK_HomeNoticeReceipts_HomeNotices_NoticeId",
                        column: x => x.NoticeId,
                        principalTable: "HomeNotices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HomeNoticeReceipts_UserId_ReadAt",
                table: "HomeNoticeReceipts",
                columns: new[] { "UserId", "ReadAt" });

            migrationBuilder.CreateIndex(
                name: "IX_HomeNotices_HomeId",
                table: "HomeNotices",
                column: "HomeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HomeNoticeReceipts");

            migrationBuilder.DropTable(
                name: "HomeNotices");
        }
    }
}
