namespace DreamTeamEver.Application.Constants;

/// <summary>Default configuration values for <see cref="Configuration.MpesaOptions"/> (overridable in appsettings).</summary>
public static class MpesaDefaults
{
    public const string Market = "vodacomDRC";
    public const string Country = "DRC";
    public const string Currency = "USD";
    public const string ServiceProviderCode = "000000";
    public const string Origin = "*";
    public const string BaseAddress = "https://openapi.m-pesa.com";

    public const int SessionLiveDelaySeconds = 30;
    public const int SessionCacheMinutes = 55;
    public const int HttpTimeoutSeconds = 60;
}
