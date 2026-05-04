using System.Globalization;
using DreamTeamEver.Api.Resources;

namespace DreamTeamEver.Api.Errors;

internal static class ApiErrorText
{
    internal static string Get(string code)
    {
        var resourceKey = ApiErrorCatalog.GetResourceKey(code);
        if (SharedResourceText.TryGet(resourceKey, out var localized))
        {
            return localized;
        }

        if (!string.Equals(resourceKey, code, StringComparison.Ordinal) &&
            SharedResourceText.TryGet(code, out localized))
        {
            return localized;
        }

        return GetGenericLocalizedFallback();
    }

    internal static string Format(string code, params object[] args)
    {
        var template = Get(code);
        return string.Format(template, args);
    }

    private static string GetGenericLocalizedFallback()
    {
        var unexpectedDetailKey = ApiErrorCatalog.GetResourceKey(ApiErrorCode.UnexpectedErrorDetail);
        if (SharedResourceText.TryGet(unexpectedDetailKey, out var fallback))
        {
            return fallback;
        }

        var language = (SharedResources.Culture ?? CultureInfo.CurrentUICulture).TwoLetterISOLanguageName;
        return string.Equals(language, "fr", StringComparison.OrdinalIgnoreCase)
            ? "Une erreur inattendue s'est produite. Veuillez réessayer plus tard."
            : "An unexpected error occurred. Please try again later.";
    }
}
