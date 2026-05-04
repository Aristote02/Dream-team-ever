namespace DreamTeamEver.Api.Resources;

internal static class SharedResourceText
{
    internal static bool TryGet(string key, out string value)
    {
        value = SharedResources.ResourceManager.GetString(key, SharedResources.Culture) ?? string.Empty;
        return !string.IsNullOrWhiteSpace(value);
    }

    internal static string Get(string key)
    {
        return TryGet(key, out var value) ? value : $"[[{key}]]";
    }

    internal static string Format(string key, params object[] args)
    {
        return string.Format(Get(key), args);
    }
}