using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DreamTeamEver.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddStudentFeesAndPaymentKind : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PaymentType",
                table: "PaymentTransactions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ScolarFeeExpiresAt",
                table: "Members",
                type: "timestamp with time zone",
                nullable: true);

            // Legacy single-fee payments map to scolar fee; grant expiry from matricule issue date.
            migrationBuilder.Sql(
                """
                UPDATE "PaymentTransactions"
                SET "PaymentType" = 1
                WHERE "Status" = 1;

                UPDATE "Members"
                SET "ScolarFeeExpiresAt" = "MatriculeIssuedAt" + INTERVAL '30 days'
                WHERE "MatriculeCode" IS NOT NULL
                  AND "MatriculeIssuedAt" IS NOT NULL
                  AND "ScolarFeeExpiresAt" IS NULL;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaymentType",
                table: "PaymentTransactions");

            migrationBuilder.DropColumn(
                name: "ScolarFeeExpiresAt",
                table: "Members");
        }
    }
}
