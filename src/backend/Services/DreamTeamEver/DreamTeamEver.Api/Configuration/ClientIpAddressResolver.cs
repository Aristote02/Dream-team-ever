using System.Net;

namespace DreamTeamEver.Api.Configuration;

/// <summary>
/// Resolves the client IP behind reverse proxies (e.g. Render <c>X-Forwarded-For</c>), then <see cref="HttpContext.Connection.RemoteIpAddress"/>.
/// </summary>
internal static class ClientIpAddressResolver
{
    public static string? GetClientIpAddress(HttpContext? context)
    {
        if (context is null)
        {
            return null;
        }

        var fromForwarded = TryGetFromForwardedFor(context);
        if (!string.IsNullOrWhiteSpace(fromForwarded))
        {
            return fromForwarded;
        }

        return FormatIp(context.Connection.RemoteIpAddress);
    }

    private static string? TryGetFromForwardedFor(HttpContext context)
    {
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(forwardedFor))
        {
            return null;
        }

        foreach (var segment in forwardedFor.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            if (!IPAddress.TryParse(segment, out var ip))
            {
                continue;
            }

            return FormatIp(ip);
        }

        return null;
    }

    private static string? FormatIp(IPAddress? ip)
    {
        if (ip is null)
        {
            return null;
        }

        if (ip.IsIPv4MappedToIPv6)
        {
            ip = ip.MapToIPv4();
        }

        return ip.ToString();
    }
}
