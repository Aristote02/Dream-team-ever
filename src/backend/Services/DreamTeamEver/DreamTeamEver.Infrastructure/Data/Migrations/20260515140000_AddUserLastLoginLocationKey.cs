using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DreamTeamEver.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUserLastLoginLocationKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LastLoginLocationKey",
                table: "Users",
                type: "character varying(16)",
                maxLength: 16,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastLoginLocationKey",
                table: "Users");
        }
    }
}
