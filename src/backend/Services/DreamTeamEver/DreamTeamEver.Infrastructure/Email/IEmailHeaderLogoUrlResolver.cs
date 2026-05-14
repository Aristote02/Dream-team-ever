namespace DreamTeamEver.Infrastructure.Email;

/// <summary>
/// Resolves the public HTTPS URL for the transactional email header image (raster, webmail-safe).
/// </summary>
internal interface IEmailHeaderLogoUrlResolver
{
    /// <summary>
    /// Returns an absolute HTTPS URL for the email header image,
    /// or <see cref="string.Empty"/> to omit the header image.
    /// </summary>
    string Resolve();
}
