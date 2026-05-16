using System.Text.Json.Serialization;

namespace DreamTeamEver.Infrastructure.Auth.Models;

internal sealed class IpWhoIsCountryResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; init; }

    [JsonPropertyName("country_code")]
    public string? CountryCode { get; init; }
}
