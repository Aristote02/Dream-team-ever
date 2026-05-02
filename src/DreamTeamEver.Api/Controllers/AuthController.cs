using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DreamTeamEver.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth)
    {
        _auth = auth;
    }

    /// <summary>Student signup (creates User + Student profile).</summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] RegisterStudentRequest request, CancellationToken cancellationToken)
    {
        var result = await _auth.RegisterStudentAsync(request, cancellationToken);
        if (result is null)
            return Conflict(new { error = "Email is already registered." });

        return StatusCode(StatusCodes.Status201Created, result);
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await _auth.LoginAsync(request, cancellationToken);
        if (result is null)
            return Unauthorized(new { error = "Invalid email or password." });

        return Ok(result);
    }
}
