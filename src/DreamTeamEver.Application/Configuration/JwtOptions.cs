namespace DreamTeamEver.Application.Configuration;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "DreamTeamEver";

    public string Audience { get; set; } = "DreamTeamEver";

    /// <summary>Symmetric signing key (must be sufficiently long for HS256).</summary>
    public string Key { get; set; } = string.Empty;

    public int AccessTokenMinutes { get; set; } = 60;

    /// <summary>Lifetime for opaque refresh tokens stored in the database.</summary>
    public int RefreshTokenDays { get; set; } = 7;
}
