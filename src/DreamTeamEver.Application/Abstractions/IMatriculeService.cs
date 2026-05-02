using DreamTeamEver.Domain.Entities;

namespace DreamTeamEver.Application.Abstractions;

public interface IMatriculeService
{
    Task<string?> TryIssueMatriculeAsync(int studentId, CancellationToken cancellationToken = default);

    Task<Student?> FindByMatriculeAsync(string code, CancellationToken cancellationToken = default);
}
