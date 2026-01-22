namespace TimesheetAPI.DTOs;

public class EmployeeHoursSummaryDto
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public decimal TotalHours { get; set; }
    public decimal BillableHours { get; set; }
    public decimal NonBillableHours { get; set; }
}

public class ProjectHoursSummaryDto
{
    public int ProjectId { get; set; }
    public string ProjectCode { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public bool IsBillable { get; set; }
    public decimal TotalHours { get; set; }
}

public class BillableSummaryDto
{
    public decimal TotalBillableHours { get; set; }
    public decimal TotalNonBillableHours { get; set; }
    public decimal TotalHours { get; set; }
    public decimal BillablePercentage { get; set; }
}

public class ReportFilterDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int? UserId { get; set; }
    public int? ProjectId { get; set; }
}
