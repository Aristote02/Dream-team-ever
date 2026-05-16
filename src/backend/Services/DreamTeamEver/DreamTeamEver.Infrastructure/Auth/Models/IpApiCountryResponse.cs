using System.Text.Json.Serialization;

namespace DreamTeamEver.Infrastructure.Auth.Models;

internal sealed class IpApiCountryResponse
{
    [JsonPropertyName("status")]
    public string? Status { get; init; }

    [JsonPropertyName("countryCode")]
    public string? CountryCode { get; init; }
}
