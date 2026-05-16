using System.Diagnostics;

namespace DreamTeamEver.Infrastructure.Auth.Telemetry;

/// <summary>OpenTelemetry <see cref="ActivitySource"/> for <c>ResolveLocationKey</c> spans.</summary>
internal static class LoginLocationTelemetry
{
    private const string ActivitySourceName = "DreamTeamEver.LoginLocation";

    public static readonly ActivitySource ActivitySource = new(ActivitySourceName);
}
