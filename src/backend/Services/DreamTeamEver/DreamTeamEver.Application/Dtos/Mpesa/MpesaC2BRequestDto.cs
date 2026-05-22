using DreamTeamEver.Domain.Enums;

namespace DreamTeamEver.Application.Dtos.Mpesa;

/// <summary>Application request to initiate an M-Pesa C2B payment.</summary>
public sealed class MpesaC2BRequestDto
{
    public Guid PaymentId { get; set; }

    public PaymentType PaymentType { get; set; }

    public decimal Amount { get; set; }

    public string Currency { get; set; } = string.Empty;

    public string CountryCode { get; set; } = string.Empty;

    public string CustomerMsisdn { get; set; } = string.Empty;

    public string TransactionReference { get; set; } = string.Empty;

    public string ThirdPartyReference { get; set; } = string.Empty;

    public string PurchasedItemsDescription { get; set; } = string.Empty;
}
