namespace DreamTeamEver.Application.Dtos.Mpesa;

/// <summary>Source for mapping gateway request + provider short code to <see cref="MpesaC2BApiRequestDto"/>.</summary>
public sealed class MpesaC2BApiRequestContext
{
    public required MpesaC2BRequestDto Request { get; init; }

    public required string ServiceProviderCode { get; init; }
}
