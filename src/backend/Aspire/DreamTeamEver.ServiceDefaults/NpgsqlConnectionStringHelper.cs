using Npgsql;

namespace DreamTeamEver.ServiceDefaults;

/// <summary>
/// Normalizes PostgreSQL connection strings for cloud hosts where SSL is required.
/// </summary>
public static class NpgsqlConnectionStringHelper
{
    public static string Normalize(string? connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return string.Empty;
        }

        var builder = new NpgsqlConnectionStringBuilder(connectionString);

        if (IsRemoteHost(builder.Host) && builder.SslMode == SslMode.Disable)
        {
            builder.SslMode = SslMode.Require;
        }

        return builder.ConnectionString;
    }

    public static string DescribeTarget(string? connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return "(not configured)";
        }

        try
        {
            var builder = new NpgsqlConnectionStringBuilder(connectionString);
            var host = string.IsNullOrWhiteSpace(builder.Host) ? "(no host)" : builder.Host;
            var database = string.IsNullOrWhiteSpace(builder.Database) ? "(default)" : builder.Database;
            return $"{host}:{builder.Port}/{database} (SSL={builder.SslMode})";
        }
        catch
        {
            return "(invalid connection string format)";
        }
    }

    private static bool IsRemoteHost(string? host)
    {
        if (string.IsNullOrWhiteSpace(host))
        {
            return false;
        }

        return !host.Equals("localhost", StringComparison.OrdinalIgnoreCase)
            && !host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase)
            && host != "::1";
    }
}
