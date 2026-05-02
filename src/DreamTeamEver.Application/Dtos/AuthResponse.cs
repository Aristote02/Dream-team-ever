namespace DreamTeamEver.Application.Dtos;

public record AuthResponse(
    string AccessToken,
    DateTimeOffset ExpiresAtUtc,
    string Email,
    string Role,
    int UserId,
    int? StudentId);
