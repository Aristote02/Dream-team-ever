using DreamTeamEver.Domain.Enums;

namespace DreamTeamEver.Application.Dtos;

public record MemberDto(
    Guid Id,
    Guid UserId,
    string FullName,
    string Email,
    string Phone,
    string? MatriculeCode,
    DateTimeOffset? MatriculeIssuedAt,
    DateTimeOffset? ScolarFeeExpiresAt,
    bool RegistrationFeePaid,
    bool ScolarFeeActive,
    PaymentType? NextPaymentType,
    decimal? NextPaymentAmount,
    string Currency,
    DateTimeOffset CreatedAt);
