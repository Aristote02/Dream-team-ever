using DreamTeamEver.Domain.Enums;

namespace DreamTeamEver.Application.Dtos;

public record PaymentTransactionDto(
    int Id,
    int StudentId,
    PaymentMethod Method,
    decimal Amount,
    string Currency,
    PaymentStatus Status,
    string? ProviderReference,
    DateTimeOffset CreatedAt,
    DateTimeOffset? CompletedAt,
    string? FailureReason);
