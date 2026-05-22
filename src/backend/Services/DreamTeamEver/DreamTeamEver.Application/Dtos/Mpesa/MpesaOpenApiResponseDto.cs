using System.Text.Json.Serialization;
using DreamTeamEver.Application.Constants;
using DreamTeamEver.Domain.Constants;

namespace DreamTeamEver.Application.Dtos.Mpesa;

/// <summary>M-Pesa Open API synchronous JSON response (<c>output_*</c>).</summary>
public sealed class MpesaOpenApiResponseDto
{
    [JsonPropertyName(MpesaResponsePropertyNames.ResponseCode)]
    public string? ResponseCode { get; set; }

    [JsonPropertyName(MpesaResponsePropertyNames.ResponseDescription)]
    public string? ResponseDescription { get; set; }

    [JsonPropertyName(MpesaResponsePropertyNames.SessionId)]
    public string? SessionId { get; set; }

    [JsonPropertyName(MpesaResponsePropertyNames.ConversationId)]
    public string? ConversationId { get; set; }

    [JsonPropertyName(MpesaResponsePropertyNames.ThirdPartyConversationId)]
    public string? ThirdPartyConversationId { get; set; }

    public bool IsSuccess =>
        string.Equals(ResponseCode, MpesaOpenApiResponseCodes.Success, StringComparison.OrdinalIgnoreCase);
}
