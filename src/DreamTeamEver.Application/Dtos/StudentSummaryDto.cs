namespace DreamTeamEver.Application.Dtos;

public record StudentSummaryDto(
    int StudentId,
    int UserId,
    string FullName,
    string Email,
    string Phone,
    string? MatriculeCode,
    DateTimeOffset? MatriculeIssuedAt,
    DateTimeOffset CreatedAt);
