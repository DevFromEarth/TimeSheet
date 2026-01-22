using Microsoft.AspNetCore.Mvc;
using TimesheetAPI.DTOs;
using TimesheetAPI.Services;

namespace TimesheetAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpPost("employee-hours")]
    public async Task<ActionResult<IEnumerable<EmployeeHoursSummaryDto>>> GetEmployeeHoursSummary(
        ReportFilterDto filter)
    {
        var summary = await _reportService.GetEmployeeHoursSummaryAsync(filter);
        return Ok(summary);
    }

    [HttpPost("project-hours")]
    public async Task<ActionResult<IEnumerable<ProjectHoursSummaryDto>>> GetProjectHoursSummary(
        ReportFilterDto filter)
    {
        var summary = await _reportService.GetProjectHoursSummaryAsync(filter);
        return Ok(summary);
    }

    [HttpPost("billable-summary")]
    public async Task<ActionResult<BillableSummaryDto>> GetBillableSummary(
        ReportFilterDto filter)
    {
        var summary = await _reportService.GetBillableSummaryAsync(filter);
        return Ok(summary);
    }
}
