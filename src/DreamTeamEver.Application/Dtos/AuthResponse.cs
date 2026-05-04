namespace DreamTeamEver.Application.Dtos;

public record AuthResponse(
    string AccessToken,
    DateTimeOffset AccessExpiresAtUtc,
    string RefreshToken,
    DateTimeOffset RefreshExpiresAtUtc,
    string Email,
    string Role,
    Guid UserId,
    Guid? MemberId);
