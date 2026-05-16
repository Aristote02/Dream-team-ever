namespace DreamTeamEver.Domain.Options;

/// <summary>HTTP geo lookup and in-memory cache settings for login location keys (<c>appsettings.json</c> section <c>GeoIp</c>).</summary>
public sealed record GeoIpOptions
{
    public static string SectionName => "GeoIp";

    public string PrimaryBaseUrl { get; init; } = "https://ipwho.is/";

    /// <summary>Optional secondary provider base URL (e.g. <c>https://ip-api.com/json/</c>). Used when primary fails.</summary>
    public string? FallbackBaseUrl { get; init; }

    public int HttpTimeoutSeconds { get; init; } = 5;

    public int DnsResolutionTimeoutSeconds { get; init; } = 2;

    public int CacheEntryTtlHours { get; init; } = 24;

    public int CacheSizeLimit { get; init; } = 10_000;
}
