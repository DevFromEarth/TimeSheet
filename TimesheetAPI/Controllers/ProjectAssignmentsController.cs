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

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<ProjectAssignmentDto>>> GetUserAssignments(
        int userId,
        [FromQuery] bool? activeOnly)
    {
        var assignments = activeOnly == true
            ? await _assignmentService.GetActiveUserAssignmentsAsync(userId)
            : await _assignmentService.GetUserAssignmentsAsync(userId);

        return Ok(assignments);
    }

    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<ProjectAssignmentDto>>> GetProjectAssignments(int projectId)
    {
        var assignments = await _assignmentService.GetProjectAssignmentsAsync(projectId);
        return Ok(assignments);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectAssignmentDto>> CreateAssignment(CreateProjectAssignmentDto dto)
    {
        try
        {
            var assignment = await _assignmentService.CreateAssignmentAsync(dto);
            return CreatedAtAction(nameof(GetUserAssignments), new { userId = assignment.UserId }, assignment);
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
