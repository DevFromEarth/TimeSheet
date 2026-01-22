using TimesheetAPI.Models;

namespace TimesheetAPI.Repositories;

public interface IProjectAssignmentRepository : IRepository<ProjectAssignment>
{
    Task<IEnumerable<ProjectAssignment>> GetAssignmentsByUserIdAsync(int userId);
    Task<IEnumerable<ProjectAssignment>> GetAssignmentsByProjectIdAsync(int projectId);
    Task<IEnumerable<ProjectAssignment>> GetActiveAssignmentsByUserIdAsync(int userId, DateTime date);
    Task<bool> IsUserAssignedToProjectAsync(int userId, int projectId, DateTime date);
}
