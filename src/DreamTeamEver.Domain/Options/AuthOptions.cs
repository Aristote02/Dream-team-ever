namespace DreamTeamEver.Domain.Options;

public sealed class AuthOptions : IDreamTeamEverOptions
{
    public static string SectionName => "Jwt";

    /// <summary>Optional Swagger UI OAuth (PKCE). Requires <see cref="Authority"/> when set.</summary>
    public string? SwaggerClientId { get; set; }

    /// <summary>OAuth/OIDC authority base URL for Swagger (e.g. https://tenant.auth0.com/).</summary>
    public string? Authority { get; set; }
}