using DreamTeamEver.Application.Dtos;

namespace DreamTeamEver.Application.Abstractions;

public interface IAuthService
{
    /// <summary>Creates a student account and profile. Returns null if email exists.</summary>
    Task<AuthResponse?> RegisterStudentAsync(RegisterStudentRequest request, CancellationToken cancellationToken = default);

    Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
}
