using Microsoft.EntityFrameworkCore;
using TimesheetAPI.Data;
using TimesheetAPI.Models;

namespace TimesheetAPI.Repositories;

public class ProjectAssignmentRepository : Repository<ProjectAssignment>, IProjectAssignmentRepository
{
    public ProjectAssignmentRepository(TimesheetDbContext context) : base(context)
    {
    }

	//public async Task<IEnumerable<ProjectAssignment>> GetAssignmentsByUserIdAsync(int userId)
	//{
	//    return await _dbSet
	//        .Include(pa => pa.Project)
	//        .Include(pa => pa.User)
	//        .Where(pa => pa.UserId == userId)
	//        .ToListAsync();
	//}

	//public async Task<IEnumerable<ProjectAssignment>> GetAssignmentsByProjectIdAsync(int projectId)
	//{
	//    return await _dbSet
	//        .Include(pa => pa.Project)
	//        .Include(pa => pa.User)
	//        .Where(pa => pa.ProjectId == projectId)
	//        .ToListAsync();
	//}

	public async Task<IEnumerable<ProjectAssignment>> GetActiveAssignmentsByUserIdAsync()
	{
		var now = DateTime.UtcNow;
		return await _dbSet
			.Include(pa => pa.Project)
			.Include(pa => pa.User)
			.Where(pa =>
				pa.IsActive &&
				pa.Project.IsActive &&
				(pa.EndDate == null || pa.EndDate >= now))
			.ToListAsync();
	}

	public async Task<IEnumerable<ProjectAssignment>> GetActiveAssignmentsByUserIdAsync(int userId)
	{
		var now = DateTime.UtcNow;
		return await _dbSet
			.Include(pa => pa.Project)
			.Include(pa => pa.User)
			.Where(pa =>
					pa.UserId == userId &&
					pa.IsActive &&
					pa.Project.IsActive &&
					(pa.EndDate == null || pa.EndDate >= now))
			.ToListAsync();
	}

    public async Task<bool> IsUserAssignedToProjectAsync(int userId, int projectId, DateTime date)
    {
        return await _dbSet
            .Include(pa => pa.Project)
            .AnyAsync(pa => pa.UserId == userId
                && pa.ProjectId == projectId
                && pa.IsActive
                && pa.Project.IsActive
                && pa.StartDate <= date
                && (pa.EndDate == null || pa.EndDate >= date));
    }
}
