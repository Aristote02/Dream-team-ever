namespace DreamTeamEver.Application.Abstractions;

/// <summary>
/// Maps a client IP (or hostname) to a stable location key (typically ISO 3166-1 alpha-2 country code) for login alerts.
/// </summary>
public interface ILoginLocationKeyResolver
{
    ValueTask<string> ResolveLocationKeyAsync(string? ipAddress, CancellationToken cancellationToken = default);
}
