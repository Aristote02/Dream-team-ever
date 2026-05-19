using DreamTeamEver.Domain.Entities;

namespace DreamTeamEver.Application.Abstractions;

public interface IMatriculeService
{
    Task<string?> TryIssueMatriculeAsync(Guid memberId, CancellationToken cancellationToken = default);

    /// <summary>Replaces the member matricule with a new unique code (scolar renewals).</summary>
    Task<string?> RegenerateMatriculeAsync(Guid memberId, CancellationToken cancellationToken = default);

    Task<Member?> FindByMatriculeAsync(string code, CancellationToken cancellationToken = default);
}
