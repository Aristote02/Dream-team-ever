using Npgsql;

namespace DreamTeamEver.ServiceDefaults;

/// <summary>
/// Normalizes PostgreSQL connection strings for cloud hosts where SSL is required.
/// Accepts Npgsql key/value strings and <c>postgresql://</c> / <c>postgres://</c> URIs (e.g. Supabase).
/// </summary>
public static class NpgsqlConnectionStringHelper
{
    public static string Normalize(string? connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return string.Empty;
        }

        var builder = Parse(connectionString);

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
            var builder = Parse(connectionString);
            var host = string.IsNullOrWhiteSpace(builder.Host) ? "(no host)" : builder.Host;
            var database = string.IsNullOrWhiteSpace(builder.Database) ? "(default)" : builder.Database;
            return $"{host}:{builder.Port}/{database} (SSL={builder.SslMode})";
        }
        catch (Exception ex)
        {
            return $"(invalid connection string: {ex.Message})";
        }
    }

    private static NpgsqlConnectionStringBuilder Parse(string connectionString)
    {
        var trimmed = connectionString.Trim().Trim('"', '\'');

        if (IsPostgresUri(trimmed))
        {
            return ParsePostgresUri(trimmed);
        }

        return new NpgsqlConnectionStringBuilder(trimmed);
    }

    private static bool IsPostgresUri(string value) =>
        value.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase)
        || value.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase);

    private static NpgsqlConnectionStringBuilder ParsePostgresUri(string uriString)
    {
        var uri = new Uri(uriString);
        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Database = string.IsNullOrEmpty(uri.AbsolutePath) || uri.AbsolutePath == "/"
                ? "postgres"
                : Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/')),
        };

        if (!string.IsNullOrEmpty(uri.UserInfo))
        {
            var parts = uri.UserInfo.Split(':', 2);
            builder.Username = Uri.UnescapeDataString(parts[0]);
            if (parts.Length > 1)
            {
                builder.Password = Uri.UnescapeDataString(parts[1]);
            }
        }

        if (uri.Query.Length > 1)
        {
            foreach (var pair in uri.Query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries))
            {
                var kv = pair.Split('=', 2);
                if (kv.Length != 2)
                {
                    continue;
                }

                var key = Uri.UnescapeDataString(kv[0]);
                var value = Uri.UnescapeDataString(kv[1]);
                builder[key] = value;
            }
        }

        return builder;
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
