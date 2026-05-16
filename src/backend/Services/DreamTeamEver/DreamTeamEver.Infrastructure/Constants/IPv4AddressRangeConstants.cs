namespace DreamTeamEver.Infrastructure.Constants;

/// <summary>First-octet and range boundaries for RFC 1918, loopback, link-local (APIPA), multicast, and reserved IPv4 space.</summary>
internal static class IPv4AddressRangeConstants
{
    public const byte LoopbackFirstOctet = 127;

    public const byte PrivateClassAFirstOctet = 10;

    public const byte PrivateClassBFirstOctet = 172;
    public const byte PrivateClassBSecondOctetMin = 16;
    public const byte PrivateClassBSecondOctetMax = 31;

    public const byte PrivateClassCFirstOctet = 192;
    public const byte PrivateClassCSecondOctet = 168;

    public const byte LinkLocalFirstOctet = 169;
    public const byte LinkLocalSecondOctet = 254;

    public const byte MulticastFirstOctetMin = 224;
    public const byte MulticastFirstOctetMax = 239;

    public const byte ReservedFirstOctetMin = 240;
}
