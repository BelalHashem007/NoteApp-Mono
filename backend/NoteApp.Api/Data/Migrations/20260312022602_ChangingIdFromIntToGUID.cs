using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NoteApp.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class ChangingIdFromIntToGUID : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Drop the Primary Key Constraint first
            migrationBuilder.DropPrimaryKey(
                name: "PK_Notes",
                table: "Notes");

            // 2. Drop the old Integer ID column
            migrationBuilder.DropColumn(
                name: "Id",
                table: "Notes");

            // 3. Add the new GUID ID column with the default SQL value
            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                table: "Notes",
                type: "uniqueidentifier",
                nullable: false,
                defaultValueSql: "NEWSEQUENTIALID()");

            // 4. Re-establish the Primary Key on the new Column
            migrationBuilder.AddPrimaryKey(
                name: "PK_Notes",
                table: "Notes",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // To go back, we have to reverse the entire process
            migrationBuilder.DropPrimaryKey(
                name: "PK_Notes",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Notes");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "Notes",
                type: "int",
                nullable: false)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Notes",
                table: "Notes",
                column: "Id");
        }
    }
}
