using System.ComponentModel.DataAnnotations;

namespace TimesheetAPI.Models;

public class Project
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string ProjectCode { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string ProjectName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string ClientName { get; set; } = string.Empty;
    
    public bool IsBillable { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public ICollection<ProjectAssignment> ProjectAssignments { get; set; } = new List<ProjectAssignment>();
    public ICollection<Timesheet> Timesheets { get; set; } = new List<Timesheet>();
}
