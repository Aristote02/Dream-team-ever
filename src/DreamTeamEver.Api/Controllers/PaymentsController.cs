using DreamTeamEver.Api.Authentication;
using DreamTeamEver.Api.Mapping;
using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Configuration;
using DreamTeamEver.Application.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _payments;
    private readonly DreamTeamEverOptions _options;
    private readonly IWebHostEnvironment _env;

    public PaymentsController(
        IPaymentService payments,
        IOptions<DreamTeamEverOptions> options,
        IWebHostEnvironment env)
    {
        _payments = payments;
        _options = options.Value;
        _env = env;
    }

    /// <summary>Start a registration payment (Student: must match your profile).</summary>
    [HttpPost("initiate")]
    [Authorize(Roles = "Student")]
    [ProducesResponseType(typeof(PaymentTransactionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Initiate([FromBody] InitiatePaymentRequest request, CancellationToken cancellationToken)
    {
        var ownStudentId = User.GetStudentId();
        if (ownStudentId != request.StudentId)
            return Forbid();

        var tx = await _payments.InitiateAsync(request.StudentId, request.Method, cancellationToken);
        if (tx is null)
            return BadRequest(new { error = "Student not found, already has a matricule, or cannot start payment." });

        return Ok(tx.ToPaymentDto());
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PaymentTransactionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var tx = await _payments.GetTransactionAsync(id, cancellationToken);
        if (tx is null)
            return NotFound();

        if (User.IsInRole("Admin"))
            return Ok(tx.ToPaymentDto());

        if (User.IsInRole("Student"))
        {
            var ownStudentId = User.GetStudentId();
            if (ownStudentId != tx.StudentId)
                return Forbid();

            return Ok(tx.ToPaymentDto());
        }

        return Forbid();
    }

    /// <summary>Simulates a successful provider callback (Student owner or Admin; dev / AllowPaymentSimulation).</summary>
    [HttpPost("{id:int}/confirm")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Confirm(int id, CancellationToken cancellationToken)
    {
        if (!(_options.AllowPaymentSimulation || _env.IsDevelopment()))
            return StatusCode(StatusCodes.Status403Forbidden, new { error = "Payment simulation is disabled." });

        var tx = await _payments.GetTransactionAsync(id, cancellationToken);
        if (tx is null)
            return NotFound();

        if (!User.IsInRole("Admin"))
        {
            if (!User.IsInRole("Student"))
                return Forbid();

            var ownStudentId = User.GetStudentId();
            if (ownStudentId != tx.StudentId)
                return Forbid();
        }

        var result = await _payments.ConfirmAsync(id, cancellationToken);
        if (!result.Success)
            return BadRequest(new { error = result.Error });

        var updated = await _payments.GetTransactionAsync(id, cancellationToken);
        return Ok(new
        {
            matriculeCode = result.MatriculeCode,
            transaction = updated?.ToPaymentDto()
        });
    }
}
