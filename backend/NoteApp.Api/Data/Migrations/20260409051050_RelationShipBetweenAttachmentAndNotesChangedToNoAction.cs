using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NoteApp.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class RelationShipBetweenAttachmentAndNotesChangedToNoAction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attachments_Notes_NoteId",
                table: "Attachments");

            migrationBuilder.AddForeignKey(
                name: "FK_Attachments_Notes_NoteId",
                table: "Attachments",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attachments_Notes_NoteId",
                table: "Attachments");

            migrationBuilder.AddForeignKey(
                name: "FK_Attachments_Notes_NoteId",
                table: "Attachments",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
