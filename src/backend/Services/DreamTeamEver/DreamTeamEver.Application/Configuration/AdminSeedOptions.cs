namespace DreamTeamEver.Application.Configuration;

/// <summary>Optional seed account for the first admin (runs on startup in Development only unless forced).</summary>
public class AdminSeedOptions
{
    public const string SectionName = "AdminSeed";

    public bool Enabled { get; set; }

    public string Email { get; set; } = "admin@dreamteam.test";

    public string Password { get; set; } = "Admin123!";
}
