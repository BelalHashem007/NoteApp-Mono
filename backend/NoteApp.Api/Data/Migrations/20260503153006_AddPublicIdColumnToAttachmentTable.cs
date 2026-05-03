using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NoteApp.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPublicIdColumnToAttachmentTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PublicId",
                table: "Attachments",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PublicId",
                table: "Attachments");
        }
    }
}
