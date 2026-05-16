namespace DreamTeamEver.Domain.Constants;

/// <summary>Stable location keys stored on <see cref="Entities.User.LastLoginLocationKey"/> and used for login-alert comparisons.</summary>
public static class LoginLocationKeys
{
    public const string Local = "local";
    public const string Unknown = "unknown";
}
