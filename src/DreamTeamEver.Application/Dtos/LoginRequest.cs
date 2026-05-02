using System.ComponentModel.DataAnnotations;

namespace DreamTeamEver.Application.Dtos;

public record LoginRequest(
    [property: Required]
    [property: EmailAddress]
    string Email,
    [property: Required]
    [property: MinLength(6)]
    string Password);
