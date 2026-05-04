using System.ComponentModel.DataAnnotations;

namespace DreamTeamEver.Application.Dtos;

public record SignUpRequest(
    [property: Required]
    [property: StringLength(200, MinimumLength = 2)]
    string FullName,
    [property: Required]
    [property: EmailAddress]
    string Email,
    [property: Required]
    [property: StringLength(32, MinimumLength = 6)]
    string Phone,
    [property: Required]
    [property: MinLength(6)]
    string Password);
