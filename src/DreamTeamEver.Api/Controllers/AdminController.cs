using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DreamTeamEver.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _admin;

    public AdminController(IAdminService admin)
    {
        _admin = admin;
    }

    [HttpGet("users")]
    [ProducesResponseType(typeof(IReadOnlyList<UserAccountDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUsers(CancellationToken cancellationToken)
    {
        var list = await _admin.GetAllUsersAsync(cancellationToken);
        return Ok(list);
    }

    [HttpGet("students")]
    [ProducesResponseType(typeof(IReadOnlyList<StudentSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStudents(CancellationToken cancellationToken)
    {
        var list = await _admin.GetAllStudentsAsync(cancellationToken);
        return Ok(list);
    }

    /// <summary>Students who completed payment and received a matricule.</summary>
    [HttpGet("students/with-matricule")]
    [ProducesResponseType(typeof(IReadOnlyList<StudentSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStudentsWithMatricule(CancellationToken cancellationToken)
    {
        var list = await _admin.GetStudentsWithMatriculeAsync(cancellationToken);
        return Ok(list);
    }

    [HttpGet("payments")]
    [ProducesResponseType(typeof(IReadOnlyList<PaymentTransactionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPayments(CancellationToken cancellationToken)
    {
        var list = await _admin.GetAllPaymentsAsync(cancellationToken);
        return Ok(list);
    }

    [HttpDelete("users/{userId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUser(int userId, CancellationToken cancellationToken)
    {
        var ok = await _admin.DeleteUserAsync(userId, cancellationToken);
        if (!ok)
            return NotFound();

        return NoContent();
    }
}
