using DreamTeamEver.Domain.Enums;

namespace DreamTeamEver.Domain.Entities;

public class User
{
    public int Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>Present when <see cref="Role"/> is <see cref="UserRole.Student"/>.</summary>
    public Student? StudentProfile { get; set; }
}
