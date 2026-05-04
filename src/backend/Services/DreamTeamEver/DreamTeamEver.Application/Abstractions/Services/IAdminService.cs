using DreamTeamEver.Application.Dtos;

namespace DreamTeamEver.Application.Abstractions;

public interface IAdminService
{
    Task<IReadOnlyList<UserAccountDto>> GetAllUsersAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<MemberSummaryDto>> GetAllMembersAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<MemberSummaryDto>> GetMembersWithMatriculeAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<PaymentTransactionDto>> GetAllPaymentsAsync(CancellationToken cancellationToken = default);

    Task<bool> DeleteUserAsync(Guid userId, CancellationToken cancellationToken = default);
}
