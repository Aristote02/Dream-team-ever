using DreamTeamEver.Domain.Entities;

namespace DreamTeamEver.Application.Abstractions.Repositories;

public interface IMemberRepository : IRepository<Member>
{
    Task<Member?> GetByIdWithUserAsync(Guid memberId, CancellationToken cancellationToken = default);

    Task<Member?> GetByUserIdWithUserAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<Member?> GetTrackedByIdAsync(Guid memberId, CancellationToken cancellationToken = default);

    Task<Member?> GetTrackedByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<bool> MatriculeCodeExistsAsync(string matriculeCode, CancellationToken cancellationToken = default);

    Task<Member?> FindByMatriculeCodeAsync(string normalizedCode, CancellationToken cancellationToken = default);

    Task<List<Member>> GetAllWithUserCreatedDescAsync(CancellationToken cancellationToken = default);

    Task<List<Member>> GetWithMatriculeOrderedAsync(CancellationToken cancellationToken = default);
}
