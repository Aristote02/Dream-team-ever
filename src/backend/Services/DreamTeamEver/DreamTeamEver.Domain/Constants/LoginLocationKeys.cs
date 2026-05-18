namespace DreamTeamEver.Domain.Constants;

/// <summary>Stable location keys stored on <see cref="Entities.User.LastLoginLocationKey"/> and used for login-alert comparisons.</summary>
public static class LoginLocationKeys
{
    public const string Local = "local";
    public const string Unknown = "unknown";

    /// <summary>Length of ISO 3166-1 alpha-2 country codes (e.g. <c>BY</c>, <c>PL</c>) stored as location keys.</summary>
    public const int IsoCountryCodeLength = 2;
}
