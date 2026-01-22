namespace TimesheetAPI.DTOs;

public class TimesheetDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int ProjectId { get; set; }
    public string ProjectCode { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public decimal HoursWorked { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? RejectionComments { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateTimesheetDto
{
    public int ProjectId { get; set; }
    public DateTime Date { get; set; }
    public decimal HoursWorked { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class UpdateTimesheetDto
{
    public int ProjectId { get; set; }
    public DateTime Date { get; set; }
    public decimal HoursWorked { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class SubmitTimesheetDto
{
    public int[] TimesheetIds { get; set; } = Array.Empty<int>();
}

public class ApproveTimesheetDto
{
    public int TimesheetId { get; set; }
}

public class RejectTimesheetDto
{
    public int TimesheetId { get; set; }
    public string RejectionComments { get; set; } = string.Empty;
}
