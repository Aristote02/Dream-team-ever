using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Domain.Entities;

namespace DreamTeamEver.Application.Abstractions;

public interface IStudentService
{
    /// <summary>Includes user for email mapping.</summary>
    Task<Student?> GetByIdAsync(int studentId, CancellationToken cancellationToken = default);

    Task<Student?> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
}
