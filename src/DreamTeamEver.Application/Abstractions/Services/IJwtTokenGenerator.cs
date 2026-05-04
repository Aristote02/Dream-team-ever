using DreamTeamEver.Domain.Entities;

namespace DreamTeamEver.Application.Abstractions;

public interface IJwtTokenGenerator
{
    (string AccessToken, DateTimeOffset AccessExpiresAtUtc, string Jti) CreateAccessToken(User user, Guid? memberId);
}
