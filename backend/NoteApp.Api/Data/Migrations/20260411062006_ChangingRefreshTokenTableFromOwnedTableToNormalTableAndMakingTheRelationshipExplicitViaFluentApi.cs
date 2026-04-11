using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NoteApp.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class ChangingRefreshTokenTableFromOwnedTableToNormalTableAndMakingTheRelationshipExplicitViaFluentApi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_RefreshToken",
                table: "RefreshToken");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RefreshToken",
                table: "RefreshToken",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_UserId",
                table: "RefreshToken",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_RefreshToken",
                table: "RefreshToken");

            migrationBuilder.DropIndex(
                name: "IX_RefreshToken_UserId",
                table: "RefreshToken");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RefreshToken",
                table: "RefreshToken",
                columns: new[] { "UserId", "Id" });
        }
    }
}
