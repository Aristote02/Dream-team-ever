using DreamTeamEver.Domain.Entities;
using DreamTeamEver.Domain.Enums;

namespace DreamTeamEver.Application.Abstractions.Repositories;

public interface IUserRepository : IRepository<User>
{
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);

    Task<bool> AnyInRoleAsync(UserRole role, CancellationToken cancellationToken = default);

    Task<User?> GetByEmailWithMemberProfileAsync(string email, CancellationToken cancellationToken = default);

    Task<User?> GetByEmailTrackedAsync(string email, CancellationToken cancellationToken = default);

    Task<User?> GetByIdTrackedAsync(Guid id, CancellationToken cancellationToken = default);

    Task<List<User>> GetAllWithMemberProfileCreatedDescAsync(CancellationToken cancellationToken = default);
}
