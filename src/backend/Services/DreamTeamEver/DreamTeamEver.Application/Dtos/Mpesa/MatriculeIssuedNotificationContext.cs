using DreamTeamEver.Domain.Entities;

namespace DreamTeamEver.Application.Dtos.Mpesa;

/// <summary>Source for mapping a matricule-issued email after scolar payment.</summary>
public sealed class MatriculeIssuedNotificationContext
{
    public required PaymentTransaction Payment { get; init; }

    public required string MatriculeCode { get; init; }
}
