using DreamTeamEver.Application.Constants;

namespace DreamTeamEver.Application.Configuration;

/// <summary>Vodacom M-Pesa Open API (DRC / vodacomDRC). Secrets via environment or user secrets.</summary>
public sealed class MpesaOptions
{
    public const string SectionName = "Mpesa";

    /// <summary>When false, M-Pesa HTTP calls are skipped (simulation / Orange-only dev).</summary>
    public bool Enabled { get; set; }

    public bool UseSandbox { get; set; } = true;

    public string ApiKey { get; set; } = string.Empty;

    /// <summary>SANDBOX platform public key (PEM or raw Base64) paired with <see cref="ApiKey"/>.</summary>
    public string SandboxPublicKey { get; set; } = string.Empty;

    /// <summary>OPENAPI platform public key for production (optional until go-live).</summary>
    public string OpenApiPublicKey { get; set; } = string.Empty;

    public string Market { get; set; } = MpesaDefaults.Market;

    public string Country { get; set; } = MpesaDefaults.Country;

    /// <summary>Defaults to <see cref="DreamTeamEverOptions.Currency"/> when empty at runtime.</summary>
    public string Currency { get; set; } = MpesaDefaults.Currency;

    /// <summary>Sandbox short code until Vodacom assigns your organisation code.</summary>
    public string ServiceProviderCode { get; set; } = MpesaDefaults.ServiceProviderCode;

    public string Origin { get; set; } = MpesaDefaults.Origin;

    /// <summary>Wait after a new session before the first C2B (portal combined sample).</summary>
    public int SessionLiveDelaySeconds { get; set; } = MpesaDefaults.SessionLiveDelaySeconds;

    public int SessionCacheMinutes { get; set; } = MpesaDefaults.SessionCacheMinutes;

    public int HttpTimeoutSeconds { get; set; } = MpesaDefaults.HttpTimeoutSeconds;

    public string BaseAddress { get; set; } = MpesaDefaults.BaseAddress;

    public string ActivePublicKey => UseSandbox ? SandboxPublicKey : OpenApiPublicKey;

    public string EnvironmentSegment =>
        UseSandbox ? MpesaEnvironmentSegments.Sandbox : MpesaEnvironmentSegments.OpenApi;
}
