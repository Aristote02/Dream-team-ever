using System.Text.Json.Serialization;
using DreamTeamEver.Application.Constants;
using DreamTeamEver.Domain.Constants;

namespace DreamTeamEver.Application.Dtos.Mpesa;

/// <summary>Asynchronous callback body from M-Pesa Open API (C2B single stage).</summary>
public sealed class MpesaCallbackNotification
{
    [JsonPropertyName(MpesaCallbackPropertyNames.OriginalConversationId)]
    public string? OriginalConversationId { get; set; }

    [JsonPropertyName(MpesaCallbackPropertyNames.TransactionId)]
    public string? TransactionId { get; set; }

    [JsonPropertyName(MpesaCallbackPropertyNames.ResultCode)]
    public string? ResultCode { get; set; }

    [JsonPropertyName(MpesaCallbackPropertyNames.ResultDescription)]
    public string? ResultDescription { get; set; }

    [JsonPropertyName(MpesaCallbackPropertyNames.ThirdPartyConversationId)]
    public string? ThirdPartyConversationId { get; set; }

    public bool IsSuccess =>
        string.Equals(ResultCode, MpesaOpenApiResponseCodes.Success, StringComparison.OrdinalIgnoreCase);
}

public sealed record MpesaCallbackAcknowledgement(
    [property: JsonPropertyName(MpesaCallbackAcknowledgementPropertyNames.OriginalConversationId)]
    string OriginalConversationId,
    [property: JsonPropertyName(MpesaCallbackAcknowledgementPropertyNames.ResponseCode)]
    string ResponseCode,
    [property: JsonPropertyName(MpesaCallbackAcknowledgementPropertyNames.ResponseDescription)]
    string ResponseDescription,
    [property: JsonPropertyName(MpesaCallbackAcknowledgementPropertyNames.ThirdPartyConversationId)]
    string ThirdPartyConversationId);
