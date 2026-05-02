namespace DreamTeamEver.Application.Common;

public sealed record PaymentResult(bool Success, string? MatriculeCode, string? Error);
