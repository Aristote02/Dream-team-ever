using DreamTeamEver.Domain.Enums;

namespace DreamTeamEver.Application.Dtos;

public record MemberSummaryDto(
    Guid MemberId,
    Guid UserId,
    string FullName,
    string Email,
    string Phone,
    UserRole Role,
    string? MatriculeCode,
    DateTimeOffset? MatriculeIssuedAt,
    DateTimeOffset CreatedAt);
