using DreamTeamEver.Domain.Entities;

namespace DreamTeamEver.Application.Abstractions;

public interface IJwtTokenGenerator
{
    (string Token, DateTimeOffset ExpiresAtUtc) CreateAccessToken(User user, int? studentId);
}
