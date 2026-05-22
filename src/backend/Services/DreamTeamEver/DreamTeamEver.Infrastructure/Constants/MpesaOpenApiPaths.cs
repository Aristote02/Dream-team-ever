namespace DreamTeamEver.Infrastructure.Constants;

internal static class MpesaOpenApiPaths
{
    private const string IpgSegment = "ipg";
    private const string ApiVersionSegment = "v2";
    public const string GetSessionOperation = "getSession/";
    public const string C2BSingleStageOperation = "c2bPayment/singleStage/";

    public static string Build(string environmentSegment, string market, string operation) =>
        $"/{environmentSegment}/{IpgSegment}/{ApiVersionSegment}/{market}/{operation}";
}
