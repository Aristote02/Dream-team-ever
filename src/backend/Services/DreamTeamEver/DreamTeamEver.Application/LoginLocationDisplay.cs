using System.Globalization;
using DreamTeamEver.Domain.Constants;

namespace DreamTeamEver.Application;

internal static class LoginLocationDisplay
{
    public static string Format(string locationKey)
    {
        if (string.IsNullOrWhiteSpace(locationKey))
        {
            return "Unknown location";
        }

        var normalized = locationKey.Trim();

        if (IsSpecialKey(normalized, LoginLocationKeys.Unknown))
        {
            return "Unknown location";
        }

        if (IsSpecialKey(normalized, LoginLocationKeys.Local))
        {
            return "Local network";
        }

        return normalized.Length == LoginLocationKeys.IsoCountryCodeLength
            ? GetCountryNameOrCode(normalized)
            : normalized;
    }

    private static bool IsSpecialKey(string value, string specialKey) =>
        string.Equals(value, specialKey, StringComparison.OrdinalIgnoreCase);

    private static string GetCountryNameOrCode(string countryCode)
    {
        var upper = countryCode.ToUpperInvariant();
        try
        {
            return new RegionInfo(upper).EnglishName;
        }
        catch (ArgumentException)
        {
            return upper;
        }
    }
}
