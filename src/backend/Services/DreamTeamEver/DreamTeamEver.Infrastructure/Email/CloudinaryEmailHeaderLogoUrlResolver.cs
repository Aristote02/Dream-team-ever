using CloudinaryDotNet;
using DreamTeamEver.Domain.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Infrastructure.Email;

/// <summary>
/// Builds the header image URL with <see cref="CloudinaryDotNet"/> (PNG delivery for SVG sources so Gmail can display it).
/// Falls back to <see cref="EmailNotificationOptions.LogoUrl"/> when Cloudinary logo settings are not configured.
/// </summary>
internal sealed class CloudinaryEmailHeaderLogoUrlResolver : IEmailHeaderLogoUrlResolver
{
    private readonly IOptionsMonitor<EmailNotificationOptions> _emailOptions;
    private readonly ILogger<CloudinaryEmailHeaderLogoUrlResolver> _logger;

    public CloudinaryEmailHeaderLogoUrlResolver(
        IOptionsMonitor<EmailNotificationOptions> emailOptions,
        ILogger<CloudinaryEmailHeaderLogoUrlResolver> logger)
    {
        _emailOptions = emailOptions;
        _logger = logger;
    }

    public string Resolve()
    {
        var o = _emailOptions.CurrentValue;

        if (TryBuildFromCloudinary(o, out var fromSdk))
        {
            return fromSdk;
        }

        return ResolveFromLogoUrl(o);
    }

    private bool TryBuildFromCloudinary(EmailNotificationOptions o, out string url)
    {
        url = string.Empty;
        if (string.IsNullOrWhiteSpace(o.CloudinaryLogoPublicId))
        {
            return false;
        }

        if (string.IsNullOrWhiteSpace(o.CloudinaryCloudName)
            || string.IsNullOrWhiteSpace(o.CloudinaryApiKey)
            || string.IsNullOrWhiteSpace(o.CloudinaryApiSecret))
        {
            _logger.LogWarning("Email CloudinaryLogoPublicId is set but CloudinaryCloudName, CloudinaryApiKey, or CloudinaryApiSecret is missing; header image omitted.");
            
            return false;
        }

        try
        {
            var account = new Account(o.CloudinaryCloudName, o.CloudinaryApiKey, o.CloudinaryApiSecret);
            var cloudinary = new Cloudinary(account);
            var transform = new Transformation()
                .Width(144)
                .Crop("scale")
                .FetchFormat("png")
                .Quality("auto");

            var urlBuilder = cloudinary.Api.UrlImgUp.Secure(true).Transform(transform);
            if (!string.IsNullOrWhiteSpace(o.CloudinaryLogoVersion))
            {
                urlBuilder = urlBuilder.Version(o.CloudinaryLogoVersion.Trim());
            }

            url = urlBuilder.BuildUrl(o.CloudinaryLogoPublicId.Trim());
            return !string.IsNullOrWhiteSpace(url);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to build Cloudinary email logo URL; header image omitted.");
            return false;
        }
    }

    private string ResolveFromLogoUrl(EmailNotificationOptions o)
    {
        var trimmed = o.LogoUrl?.Trim();
        if (string.IsNullOrEmpty(trimmed))
        {
            _logger.LogDebug("Email LogoUrl is empty and no Cloudinary logo is configured; header image omitted.");
            return string.Empty;
        }

        if (!Uri.TryCreate(trimmed, UriKind.Absolute, out var logoUri))
        {
            _logger.LogWarning("Email LogoUrl is not a valid absolute URI; header image omitted.");
            return string.Empty;
        }

        if (string.Equals(logoUri.Host, "asset.cloudinary.com", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning(
                "Email LogoUrl uses {LogoHost} (Media Library / share link). Use Cloudinary delivery (Email:Cloudinary* + public id) or a res.cloudinary.com image/upload URL.",
                logoUri.Host);
            return string.Empty;
        }

        if (string.Equals(logoUri.Scheme, "data", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Email LogoUrl must be an https URL for webmail; data: URIs are not supported.");
            return string.Empty;
        }

        return trimmed;
    }
}
