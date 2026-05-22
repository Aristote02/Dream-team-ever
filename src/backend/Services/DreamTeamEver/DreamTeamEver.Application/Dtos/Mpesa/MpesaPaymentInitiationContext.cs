using DreamTeamEver.Domain.Entities;

namespace DreamTeamEver.Application.Dtos.Mpesa;

/// <summary>Source for mapping a pending payment to <see cref="MpesaC2BRequestDto"/>.</summary>
public sealed class MpesaPaymentInitiationContext
{
    public required PaymentTransaction Transaction { get; init; }

    public required string CustomerMsisdn { get; init; }

    public required string Currency { get; init; }

    public required string CountryCode { get; init; }
}
