namespace DreamTeamEver.Domain.Options;

public sealed record ConnectionStringsOptions : IDreamTeamEverOptions
{
    public static string SectionName => "ConnectionStrings";
    public required string DreamTeamEverDbConnectionString { get; init; }
    public string? RedisConnectionString { get; init; }
}