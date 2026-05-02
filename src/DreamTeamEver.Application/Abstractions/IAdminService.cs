using DreamTeamEver.Application.Dtos;

namespace DreamTeamEver.Application.Abstractions;

public interface IAdminService
{
    Task<IReadOnlyList<UserAccountDto>> GetAllUsersAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<StudentSummaryDto>> GetAllStudentsAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<StudentSummaryDto>> GetStudentsWithMatriculeAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<PaymentTransactionDto>> GetAllPaymentsAsync(CancellationToken cancellationToken = default);

    /// <summary>Deletes the user and cascades student profile and related payments.</summary>
    Task<bool> DeleteUserAsync(int userId, CancellationToken cancellationToken = default);
}
