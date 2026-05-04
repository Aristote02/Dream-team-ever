namespace DreamTeamEver.Application.Dtos;

public sealed record PaymentConfirmationDto(string? MatriculeCode, PaymentTransactionDto? Transaction);
