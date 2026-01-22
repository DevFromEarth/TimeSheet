using TimesheetAPI.DTOs;
using TimesheetAPI.Patterns;

namespace TimesheetAPI.Services;

public interface IReportService
{
    Task<IEnumerable<EmployeeHoursSummaryDto>> GetEmployeeHoursSummaryAsync(ReportFilterDto filter);
    Task<IEnumerable<ProjectHoursSummaryDto>> GetProjectHoursSummaryAsync(ReportFilterDto filter);
    Task<BillableSummaryDto> GetBillableSummaryAsync(ReportFilterDto filter);
}

public class ReportService : IReportService
{
    private readonly IReportFactory _reportFactory;

    public ReportService(IReportFactory reportFactory)
    {
        _reportFactory = reportFactory;
    }

    public async Task<IEnumerable<EmployeeHoursSummaryDto>> GetEmployeeHoursSummaryAsync(ReportFilterDto filter)
    {
        var report = _reportFactory.CreateReport("employeehours");
        var result = await report.GenerateAsync(filter);
        return (IEnumerable<EmployeeHoursSummaryDto>)result;
    }

    public async Task<IEnumerable<ProjectHoursSummaryDto>> GetProjectHoursSummaryAsync(ReportFilterDto filter)
    {
        var report = _reportFactory.CreateReport("projecthours");
        var result = await report.GenerateAsync(filter);
        return (IEnumerable<ProjectHoursSummaryDto>)result;
    }

    public async Task<BillableSummaryDto> GetBillableSummaryAsync(ReportFilterDto filter)
    {
        var report = _reportFactory.CreateReport("billablehours");
        var result = await report.GenerateAsync(filter);
        return (BillableSummaryDto)result;
    }
}
