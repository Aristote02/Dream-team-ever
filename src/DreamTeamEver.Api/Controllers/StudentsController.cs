using DreamTeamEver.Api.Authentication;
using DreamTeamEver.Api.Mapping;
using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DreamTeamEver.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StudentsController : ControllerBase
{
    private readonly IStudentService _students;

    public StudentsController(IStudentService students)
    {
        _students = students;
    }

    /// <summary>Current student profile (role Student).</summary>
    [HttpGet("me")]
    [Authorize(Roles = "Student")]
    [ProducesResponseType(typeof(StudentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var student = await _students.GetByUserIdAsync(userId, cancellationToken);
        if (student is null)
            return NotFound();

        return Ok(student.ToStudentDto());
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(StudentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var student = await _students.GetByIdAsync(id, cancellationToken);
        if (student is null)
            return NotFound();

        if (User.IsInRole("Admin"))
            return Ok(student.ToStudentDto());

        if (User.IsInRole("Student"))
        {
            var ownId = User.GetStudentId();
            if (ownId != id)
                return Forbid();

            return Ok(student.ToStudentDto());
        }

        return Forbid();
    }
}
