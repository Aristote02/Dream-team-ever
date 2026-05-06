using DreamTeamEver.Domain.Enums;

namespace DreamTeamEver.Application.Dtos;

public record PaymentTransactionDto(
    Guid Id,
    string? MemberFullName,
    PaymentMethod Method,
    decimal Amount,
    string Currency,
    PaymentStatus Status,
    string? ProviderReference,
    DateTimeOffset CreatedAt,
    DateTimeOffset? CompletedAt,
    string? FailureReason);
