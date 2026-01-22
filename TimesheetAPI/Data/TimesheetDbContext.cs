using Microsoft.EntityFrameworkCore;
using TimesheetAPI.Models;

namespace TimesheetAPI.Data;

public class TimesheetDbContext : DbContext
{
    public TimesheetDbContext(DbContextOptions<TimesheetDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Project> Projects { get; set; } = null!;
    public DbSet<ProjectAssignment> ProjectAssignments { get; set; } = null!;
    public DbSet<Timesheet> Timesheets { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // Configure Project
        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasIndex(e => e.ProjectCode).IsUnique();
        });

        // Configure ProjectAssignment
        modelBuilder.Entity<ProjectAssignment>(entity =>
        {
            entity.HasOne(pa => pa.User)
                .WithMany(u => u.ProjectAssignments)
                .HasForeignKey(pa => pa.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(pa => pa.Project)
                .WithMany(p => p.ProjectAssignments)
                .HasForeignKey(pa => pa.ProjectId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.UserId, e.ProjectId, e.StartDate });
        });

        // Configure Timesheet
        modelBuilder.Entity<Timesheet>(entity =>
        {
            entity.HasOne(t => t.User)
                .WithMany(u => u.Timesheets)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(t => t.Project)
                .WithMany(p => p.Timesheets)
                .HasForeignKey(t => t.ProjectId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.UserId, e.ProjectId, e.Date }).IsUnique();
            entity.Property(e => e.HoursWorked).HasColumnType("decimal(5,2)");
        });

        // Seed initial data
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Seed Users (passwords should be hashed in production)
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Name = "Manager User",
                Email = "manager@example.com",
                Password = "Manager123!", // In production, hash this
                Role = "Manager",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = 2,
                Name = "Employee User",
                Email = "employee@example.com",
                Password = "Employee123!", // In production, hash this
                Role = "Employee",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        );

        // Seed Projects
        modelBuilder.Entity<Project>().HasData(
            new Project
            {
                Id = 1,
                ProjectCode = "PROJ001",
                ProjectName = "Project Alpha",
                ClientName = "Client A",
                IsBillable = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Project
            {
                Id = 2,
                ProjectCode = "PROJ002",
                ProjectName = "Internal Development",
                ClientName = "Internal",
                IsBillable = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        );
    }
}
