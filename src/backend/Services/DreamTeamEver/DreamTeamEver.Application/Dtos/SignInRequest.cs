using System.ComponentModel.DataAnnotations;

namespace DreamTeamEver.Application.Dtos;

public record SignInRequest(
    [property: Required]
    [property: EmailAddress]
    string Email,
    [property: Required]
    [property: MinLength(6)]
    string Password);
