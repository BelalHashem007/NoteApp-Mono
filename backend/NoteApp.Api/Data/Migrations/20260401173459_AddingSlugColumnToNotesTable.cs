using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NoteApp.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddingSlugColumnToNotesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "Notes",
                type: "nvarchar(70)",
                maxLength: 70,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_Slug",
                table: "Notes",
                column: "Slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Notes_Slug",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "Notes");
        }
    }
}
