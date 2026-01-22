using Microsoft.AspNetCore.Mvc;
using TimesheetAPI.DTOs;
using TimesheetAPI.Services;

namespace TimesheetAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TimesheetsController : ControllerBase
{
    private readonly ITimesheetService _timesheetService;

    public TimesheetsController(ITimesheetService timesheetService)
    {
        _timesheetService = timesheetService;
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<TimesheetDto>>> GetUserTimesheets(int userId)
    {
        var timesheets = await _timesheetService.GetUserTimesheetsAsync(userId);
        return Ok(timesheets);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TimesheetDto>> GetTimesheet(int id)
    {
        var timesheet = await _timesheetService.GetTimesheetByIdAsync(id);
        if (timesheet == null)
            return NotFound();

        return Ok(timesheet);
    }

    [HttpGet("pending")]
    public async Task<ActionResult<IEnumerable<TimesheetDto>>> GetPendingTimesheets()
    {
        var timesheets = await _timesheetService.GetPendingTimesheetsAsync();
        return Ok(timesheets);
    }

    [HttpPost]
    public async Task<ActionResult<TimesheetDto>> CreateTimesheet(
        CreateTimesheetDto dto,
        [FromHeader(Name = "X-User-Id")] int userId)
    {
        try
        {
            var timesheet = await _timesheetService.CreateTimesheetAsync(dto, userId);
            return CreatedAtAction(nameof(GetTimesheet), new { id = timesheet.Id }, timesheet);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TimesheetDto>> UpdateTimesheet(
        int id,
        UpdateTimesheetDto dto,
        [FromHeader(Name = "X-User-Id")] int userId)
    {
        try
        {
            var timesheet = await _timesheetService.UpdateTimesheetAsync(id, dto, userId);
            return Ok(timesheet);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTimesheet(
        int id,
        [FromHeader(Name = "X-User-Id")] int userId)
    {
        try
        {
            await _timesheetService.DeleteTimesheetAsync(id, userId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("submit")]
    public async Task<IActionResult> SubmitTimesheets(
        SubmitTimesheetDto dto,
        [FromHeader(Name = "X-User-Id")] int userId)
    {
        try
        {
            await _timesheetService.SubmitTimesheetsAsync(dto.TimesheetIds, userId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> ApproveTimesheet(
        int id,
        [FromHeader(Name = "X-User-Id")] int approverId)
    {
        try
        {
            await _timesheetService.ApproveTimesheetAsync(id, approverId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/reject")]
    public async Task<IActionResult> RejectTimesheet(
        int id,
        RejectTimesheetDto dto,
        [FromHeader(Name = "X-User-Id")] int approverId)
    {
        try
        {
            await _timesheetService.RejectTimesheetAsync(id, dto.RejectionComments, approverId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }
}
