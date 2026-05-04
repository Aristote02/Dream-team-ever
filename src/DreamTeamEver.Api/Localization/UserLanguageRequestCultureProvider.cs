using Microsoft.AspNetCore.Localization;

namespace DreamTeamEver.Api.Localization;

/// <summary>
/// Honors <c>User-Language</c> (API / Swagger) then falls back to <c>Accept-Language</c>.
/// Supported: English (en) and French (fr).
/// </summary>
public sealed class UserLanguageRequestCultureProvider : RequestCultureProvider
{
    public override Task<ProviderCultureResult?> DetermineProviderCultureResult(HttpContext httpContext)
    {
        var header = httpContext.Request.Headers["User-Language"].ToString();
        if (!string.IsNullOrWhiteSpace(header))
        {
            var culture = header.StartsWith("fr", StringComparison.OrdinalIgnoreCase) ? "fr-FR" : "en-US";
            return Task.FromResult<ProviderCultureResult?>(new ProviderCultureResult(culture));
        }

        var accept = httpContext.Request.Headers.AcceptLanguage.ToString();
        if (!string.IsNullOrWhiteSpace(accept))
        {
            var first = accept.Split(',').FirstOrDefault()?.Trim().Split(';').FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(first))
            {
                var culture = first.StartsWith("fr", StringComparison.OrdinalIgnoreCase) ? "fr-FR" : "en-US";
                return Task.FromResult<ProviderCultureResult?>(new ProviderCultureResult(culture));
            }
        }

        return Task.FromResult<ProviderCultureResult?>(null);
    }
}
