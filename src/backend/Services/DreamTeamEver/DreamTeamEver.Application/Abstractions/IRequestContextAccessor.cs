namespace DreamTeamEver.Application.Abstractions;

public interface IRequestContextAccessor
{
    RequestContext GetCurrent();
}

public sealed record RequestContext(string? IpAddress, string? UserAgent);
