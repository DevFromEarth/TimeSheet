using TimesheetAPI.Models;

namespace TimesheetAPI.Repositories;

public interface IProjectAssignmentRepository : IRepository<ProjectAssignment>
{
    Task<IEnumerable<ProjectAssignment>> GetActiveAssignmentsByUserIdAsync();
    Task<IEnumerable<ProjectAssignment>> GetActiveAssignmentsByUserIdAsync(int userId);
    Task<bool> IsUserAssignedToProjectAsync(int userId, int projectId, DateTime date);
}
