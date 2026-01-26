using TimesheetAPI.DTOs;
using TimesheetAPI.Repositories;

namespace TimesheetAPI.Patterns;

public interface IReportFactory
{
    IReport CreateReport(string reportType);
}

public interface IReport
{
    Task<object> GenerateAsync(ReportFilterDto filter);
    string GetReportName();
}

public class EmployeeHoursReport : IReport
{
    private readonly IUnitOfWork _unitOfWork;

    public EmployeeHoursReport(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<object> GenerateAsync(ReportFilterDto filter)
    {
        var timesheets = await _unitOfWork.Timesheets
            .GetTimesheetsByDateRangeAsync(filter.StartDate, filter.EndDate);

        if (filter.UserId.HasValue)
        {
            timesheets = timesheets.Where(t => t.UserId == filter.UserId.Value);
        }

        var approvedTimesheets = timesheets.Where(t => t.Status == "Approved");

        var summary = approvedTimesheets
            .GroupBy(t => new { t.UserId, t.User.Name })
            .Select(g => new EmployeeHoursSummaryDto
            {
                UserId = g.Key.UserId,
                UserName = g.Key.Name,
                TotalHours = g.Sum(t => t.HoursWorked),
                BillableHours = g.Where(t => t.Project.IsBillable).Sum(t => t.HoursWorked),
                NonBillableHours = g.Where(t => !t.Project.IsBillable).Sum(t => t.HoursWorked)
            })
            .ToList();

        return summary;
    }

    public string GetReportName() => "EmployeeHours";
}

public class ProjectHoursReport : IReport
{
    private readonly IUnitOfWork _unitOfWork;

    public ProjectHoursReport(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<object> GenerateAsync(ReportFilterDto filter)
    {
        var timesheets = await _unitOfWork.Timesheets
            .GetTimesheetsByDateRangeAsync(filter.StartDate, filter.EndDate);

        if (filter.ProjectId.HasValue)
        {
            timesheets = timesheets.Where(t => t.ProjectId == filter.ProjectId.Value);
        }

        var approvedTimesheets = timesheets.Where(t => t.Status == "Approved");

        var summary = approvedTimesheets
            .GroupBy(t => new
            {
                t.ProjectId,
                t.Project.ProjectCode,
                t.Project.ProjectName,
                t.Project.ClientName,
                t.Project.IsBillable
            })
            .Select(g => new ProjectHoursSummaryDto
            {
                ProjectId = g.Key.ProjectId,
                ProjectCode = g.Key.ProjectCode,
                ProjectName = g.Key.ProjectName,
                ClientName = g.Key.ClientName,
                IsBillable = g.Key.IsBillable,
                TotalHours = g.Sum(t => t.HoursWorked)
            })
            .ToList();

        return summary;
    }

    public string GetReportName() => "ProjectHours";
}

public class BillableHoursReport : IReport
{
    private readonly IUnitOfWork _unitOfWork;

    public BillableHoursReport(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<object> GenerateAsync(ReportFilterDto filter)
    {
        var timesheets = await _unitOfWork.Timesheets
            .GetTimesheetsByDateRangeAsync(filter.StartDate, filter.EndDate);

        var approvedTimesheets = timesheets.Where(t => t.Status == "Approved").ToList();

        var totalBillable = approvedTimesheets.Where(t => t.Project.IsBillable).Sum(t => t.HoursWorked);
        var totalNonBillable = approvedTimesheets.Where(t => !t.Project.IsBillable).Sum(t => t.HoursWorked);
        var totalHours = totalBillable + totalNonBillable;

        var summary = new BillableSummaryDto
        {
            TotalBillableHours = totalBillable,
            TotalNonBillableHours = totalNonBillable,
            TotalHours = totalHours,
            BillablePercentage = totalHours > 0 ? (totalBillable / totalHours) * 100 : 0
        };

        return summary;
    }

    public string GetReportName() => "BillableHours";
}

public class ReportFactory : IReportFactory
{
    private readonly IServiceProvider _serviceProvider;

    public ReportFactory(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public IReport CreateReport(string reportType)
    {
        var unitOfWork = _serviceProvider.GetRequiredService<IUnitOfWork>();

        return reportType.ToLower() switch
        {
            "employeehours" => new EmployeeHoursReport(unitOfWork),
            "projecthours" => new ProjectHoursReport(unitOfWork),
            "billablehours" => new BillableHoursReport(unitOfWork),
            _ => throw new ArgumentException($"Unknown report type: {reportType}")
        };
    }
}
