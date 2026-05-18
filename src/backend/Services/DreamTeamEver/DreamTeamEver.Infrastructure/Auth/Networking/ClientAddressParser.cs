using System.Net;
using System.Net.Sockets;
using DreamTeamEver.Infrastructure.Constants;

namespace DreamTeamEver.Infrastructure.Auth.Networking;

/// <summary>Normalizes and validates client addresses before geo lookup.</summary>
internal static class ClientAddressParser
{
    /// <summary>
    /// Parses an IP literal or resolves a hostname (DNS, with timeout).
    /// Returns <see langword="null"/> for private, link-local, multicast, loopback, or failed resolution.
    /// </summary>
    public static async Task<IPAddress?> TryParseOrResolveAsync(string? hostOrAddress, TimeSpan dnsTimeout, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(hostOrAddress))
        {
            return null;
        }

        var trimmed = hostOrAddress.Trim();
        if (IPAddress.TryParse(trimmed, out var parsed))
        {
            return ToPublicClientAddressOrNull(parsed);
        }

        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(dnsTimeout);

        try
        {
            var addresses = await Dns.GetHostAddressesAsync(trimmed, timeoutCts.Token);
            return addresses
                .Select(Normalize)
                .FirstOrDefault(IsPublicRoutable);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            return null;
        }
        catch (SocketException)
        {
            return null;
        }
    }

    private static IPAddress? ToPublicClientAddressOrNull(IPAddress ip)
    {
        ip = Normalize(ip);
        return IsPublicRoutable(ip) ? ip : null;
    }

    private static bool IsPublicRoutable(IPAddress ip)
    {
        if (IPAddress.IsLoopback(ip))
        {
            return false;
        }

        return ip.AddressFamily switch
        {
            AddressFamily.InterNetwork => !IsNonRoutableIPv4(ip.GetAddressBytes()),
            AddressFamily.InterNetworkV6 => !IsNonRoutableIPv6(ip),
            _ => false,
        };
    }

    private static bool IsNonRoutableIPv6(IPAddress ip) =>
        ip.IsIPv6LinkLocal || ip.IsIPv6UniqueLocal || ip.IsIPv6Multicast;

    private static bool IsNonRoutableIPv4(byte[] bytes)
    {
        if (bytes.Length != 4)
        {
            return true;
        }

        return (bytes[0], bytes[1]) switch
        {
            (IPv4AddressRangeConstants.LoopbackFirstOctet, _) => true,
            (IPv4AddressRangeConstants.PrivateClassAFirstOctet, _) => true,
            (IPv4AddressRangeConstants.PrivateClassBFirstOctet,
                >= IPv4AddressRangeConstants.PrivateClassBSecondOctetMin
                and <= IPv4AddressRangeConstants.PrivateClassBSecondOctetMax) => true,
            (IPv4AddressRangeConstants.PrivateClassCFirstOctet, IPv4AddressRangeConstants.PrivateClassCSecondOctet) => true,
            (IPv4AddressRangeConstants.LinkLocalFirstOctet, IPv4AddressRangeConstants.LinkLocalSecondOctet) => true,
            (>= IPv4AddressRangeConstants.MulticastFirstOctetMin, _) => true,
            _ => false,
        };
    }

    private static IPAddress Normalize(IPAddress ip) =>
        ip.IsIPv4MappedToIPv6 ? ip.MapToIPv4() : ip;
}
