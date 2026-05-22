using System.Text.Json.Serialization;
using DreamTeamEver.Application.Constants;

namespace DreamTeamEver.Application.Dtos.Mpesa;

/// <summary>C2B single-stage request body sent to M-Pesa Open API.</summary>
public sealed class MpesaC2BApiRequestDto
{
    [JsonPropertyName(MpesaRequestParameterNames.Amount)]
    public string Amount { get; set; } = string.Empty;

    [JsonPropertyName(MpesaRequestParameterNames.Country)]
    public string Country { get; set; } = string.Empty;

    [JsonPropertyName(MpesaRequestParameterNames.Currency)]
    public string Currency { get; set; } = string.Empty;

    [JsonPropertyName(MpesaRequestParameterNames.CustomerMsisdn)]
    public string CustomerMsisdn { get; set; } = string.Empty;

    [JsonPropertyName(MpesaRequestParameterNames.ServiceProviderCode)]
    public string ServiceProviderCode { get; set; } = string.Empty;

    [JsonPropertyName(MpesaRequestParameterNames.ThirdPartyConversationId)]
    public string ThirdPartyConversationId { get; set; } = string.Empty;

    [JsonPropertyName(MpesaRequestParameterNames.ThirdPartyReference)]
    public string ThirdPartyReference { get; set; } = string.Empty;

    [JsonPropertyName(MpesaRequestParameterNames.TransactionReference)]
    public string TransactionReference { get; set; } = string.Empty;

    [JsonPropertyName(MpesaRequestParameterNames.PurchasedItemsDescription)]
    public string PurchasedItemsDescription { get; set; } = string.Empty;
}
