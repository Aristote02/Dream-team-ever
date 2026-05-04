namespace DreamTeamEver.Application.Dtos;

public record MemberSummaryDto(
    Guid MemberId,
    Guid UserId,
    string FullName,
    string Email,
    string Phone,
    string? MatriculeCode,
    DateTimeOffset? MatriculeIssuedAt,
    DateTimeOffset CreatedAt);
