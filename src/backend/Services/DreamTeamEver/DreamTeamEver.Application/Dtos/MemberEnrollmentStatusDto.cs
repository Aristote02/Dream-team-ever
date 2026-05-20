using DreamTeamEver.Domain.Enums;

namespace DreamTeamEver.Application.Dtos;

public record MemberEnrollmentStatusDto(
    bool RegistrationFeePaid,
    bool HasMatricule,
    bool ScolarFeeActive,
    DateTimeOffset? ScolarFeeExpiresAt,
    PaymentType? NextPaymentType,
    decimal? NextPaymentAmount,
    string Currency);
