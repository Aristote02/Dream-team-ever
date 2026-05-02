namespace DreamTeamEver.Application.Dtos;

public record StudentDto(
    int Id,
    int UserId,
    string FullName,
    string Email,
    string Phone,
    string? MatriculeCode,
    DateTimeOffset? MatriculeIssuedAt,
    DateTimeOffset CreatedAt);
