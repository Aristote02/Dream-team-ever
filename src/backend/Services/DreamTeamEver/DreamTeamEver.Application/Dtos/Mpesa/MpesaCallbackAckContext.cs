namespace DreamTeamEver.Application.Dtos.Mpesa;

/// <summary>Source for mapping an async callback acknowledgement to M-Pesa.</summary>
public sealed class MpesaCallbackAckContext
{
    public required MpesaCallbackNotification Callback { get; init; }

    public required string ResponseCode { get; init; }

    public required string ResponseDescription { get; init; }

    public Guid? PaymentId { get; init; }
}
