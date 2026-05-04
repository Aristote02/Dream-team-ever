namespace DreamTeamEver.Application.Dtos;

public record MemberDto(
    Guid Id,
    Guid UserId,
    string FullName,
    string Email,
    string Phone,
    string? MatriculeCode,
    DateTimeOffset? MatriculeIssuedAt,
    DateTimeOffset CreatedAt);
