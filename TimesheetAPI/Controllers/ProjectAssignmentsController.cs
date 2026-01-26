using Microsoft.AspNetCore.Mvc;
using TimesheetAPI.DTOs;
using TimesheetAPI.Services;

namespace TimesheetAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectAssignmentsController : ControllerBase
{
    private readonly IProjectAssignmentService _assignmentService;

    public ProjectAssignmentsController(IProjectAssignmentService assignmentService)
    {
        _assignmentService = assignmentService;
    }


	[HttpGet()]
	public async Task<ActionResult<IEnumerable<ProjectAssignmentDto>>> GetProjectAssignments()
	{
        var assignments = await _assignmentService.GetActiveUserAssignmentsAsync();

		return Ok(assignments);
	}

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<ProjectAssignmentDto>>> GetActiveAssignmentsByUserId(int userId)
    {
        var assignments = await _assignmentService.GetActiveUserAssignmentsAsync(userId);
        return Ok(assignments);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectAssignmentDto>> CreateAssignment(CreateProjectAssignmentDto dto)
    {
        try
        {
            var assignment = await _assignmentService.CreateAssignmentAsync(dto);
			return NoContent();
		}
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("batch")]
    public async Task<ActionResult<IEnumerable<ProjectAssignmentDto>>> CreateAssignments([FromBody] List<CreateProjectAssignmentDto> dtos)
    {
        try
        {
            var assignments = await _assignmentService.CreateAssignmentsAsync(dtos);
            return Ok(assignments);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProjectAssignmentDto>> UpdateAssignment(int id, UpdateProjectAssignmentDto dto)
    {
        try
        {
            var assignment = await _assignmentService.UpdateAssignmentAsync(id, dto);
            return Ok(assignment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAssignment(int id)
    {
        try
        {
            await _assignmentService.DeleteAssignmentAsync(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
