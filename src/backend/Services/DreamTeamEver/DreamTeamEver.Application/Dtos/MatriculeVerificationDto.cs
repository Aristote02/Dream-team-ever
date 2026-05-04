namespace DreamTeamEver.Application.Dtos;

public record MatriculeVerificationDto(bool Valid, string? FullName, DateTimeOffset? MatriculeIssuedAt);
