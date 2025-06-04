using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class FixTimestampConversion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserId1",
                table: "MegaLinks",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MegaLinks_UserId1",
                table: "MegaLinks",
                column: "UserId1");

            migrationBuilder.AddForeignKey(
                name: "FK_MegaLinks_Users_UserId1",
                table: "MegaLinks",
                column: "UserId1",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MegaLinks_Users_UserId1",
                table: "MegaLinks");

            migrationBuilder.DropIndex(
                name: "IX_MegaLinks_UserId1",
                table: "MegaLinks");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "MegaLinks");
        }
    }
}
