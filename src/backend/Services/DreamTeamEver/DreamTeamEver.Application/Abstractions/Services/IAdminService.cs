using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Domain.Contracts.Pagination;
using DreamTeamEver.Domain.Enums;

namespace DreamTeamEver.Application.Abstractions;

public interface IAdminService
{
    Task<IReadOnlyList<UserAccountDto>> GetAllUsersAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<MemberSummaryDto>> GetAllMembersAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<MemberSummaryDto>> GetMembersWithMatriculeAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<PaymentTransactionDto>> GetAllPaymentsAsync(CancellationToken cancellationToken = default);

    Task<PagedResult<PaymentTransactionDto>> GetPaymentsPagedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);

    Task<bool> DeleteUserAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<bool> ChangeUserRoleAsync(Guid userId, UserRole role, CancellationToken cancellationToken = default);
}
