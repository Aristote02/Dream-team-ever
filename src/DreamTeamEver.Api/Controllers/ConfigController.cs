using DreamTeamEver.Application.Configuration;
using DreamTeamEver.Application.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class ConfigController : ControllerBase
{
    private readonly DreamTeamEverOptions _options;

    public ConfigController(IOptions<DreamTeamEverOptions> options)
    {
        _options = options.Value;
    }

    /// <summary>Registration fee and currency for the React checkout UI.</summary>
    [HttpGet("registration")]
    [ProducesResponseType(typeof(RegistrationConfigDto), StatusCodes.Status200OK)]
    public IActionResult GetRegistration()
    {
        return Ok(new RegistrationConfigDto(_options.RegistrationFee, _options.Currency));
    }
}
