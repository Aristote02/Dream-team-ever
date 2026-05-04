using System.ComponentModel.DataAnnotations;

namespace DreamTeamEver.Application.Dtos;

public record ResetPasswordRequest(
    [property: Required]
    [property: EmailAddress]
    string Email,
    [property: Required]
    string Token,
    [property: Required]
    [property: MinLength(6)]
    string NewPassword);
