namespace DreamTeamEver.Application.Dtos.Mpesa;

/// <summary>Outcome of an M-Pesa C2B initiation call.</summary>
public sealed class MpesaC2BResultDto
{
    public bool Succeeded { get; set; }

    public string? ConversationId { get; set; }

    public string? ResponseCode { get; set; }

    public string? ResponseDescription { get; set; }

    public string? ErrorMessage { get; set; }
}
