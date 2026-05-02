using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DreamTeamEver.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class MatriculesController : ControllerBase
{
    private readonly IMatriculeService _matricules;

    public MatriculesController(IMatriculeService matricules)
    {
        _matricules = matricules;
    }

    /// <summary>Public verification: confirms a matricule exists and returns the holder name.</summary>
    [HttpGet("verify")]
    [ProducesResponseType(typeof(MatriculeVerificationDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Verify([FromQuery] string code, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(code))
            return Ok(new MatriculeVerificationDto(false, null, null));

        var student = await _matricules.FindByMatriculeAsync(code, cancellationToken);
        if (student is null)
            return Ok(new MatriculeVerificationDto(false, null, null));

        return Ok(new MatriculeVerificationDto(true, student.FullName, student.MatriculeIssuedAt));
    }
}
