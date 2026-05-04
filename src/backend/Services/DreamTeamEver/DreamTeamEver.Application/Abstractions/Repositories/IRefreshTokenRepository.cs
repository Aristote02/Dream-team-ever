using DreamTeamEver.Domain.Entities;

namespace DreamTeamEver.Application.Abstractions.Repositories;

public interface IRefreshTokenRepository : IRepository<RefreshToken>
{
    Task<RefreshToken?> FindActiveByTokenHashWithUserAsync(string tokenHash, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<RefreshToken>> ListActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}
