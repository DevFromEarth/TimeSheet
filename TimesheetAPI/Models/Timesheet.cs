using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TimesheetAPI.Models;

public class Timesheet
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int UserId { get; set; }
    
    [Required]
    public int ProjectId { get; set; }
    
    [Required]
    public DateTime Date { get; set; }
    
    [Required]
    [Range(0.1, 24.0)]
    public decimal HoursWorked { get; set; }
    
    [Required]
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Draft"; // Draft, Submitted, Approved, Rejected
    
    [MaxLength(500)]
    public string? RejectionComments { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? SubmittedAt { get; set; }
    
    public DateTime? ApprovedAt { get; set; }
    
    public int? ApprovedBy { get; set; }
    
    // Navigation properties
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;
    
    [ForeignKey(nameof(ProjectId))]
    public Project Project { get; set; } = null!;
}
