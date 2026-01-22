using Microsoft.EntityFrameworkCore;
using TimesheetAPI.Data;
using TimesheetAPI.Models;

namespace TimesheetAPI.Repositories;

public class TimesheetRepository : Repository<Timesheet>, ITimesheetRepository
{
    public TimesheetRepository(TimesheetDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Timesheet>> GetTimesheetsByUserIdAsync(int userId)
    {
        return await _dbSet
            .Include(t => t.Project)
            .Include(t => t.User)
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.Date)
            .ToListAsync();
    }

    public async Task<IEnumerable<Timesheet>> GetTimesheetsByStatusAsync(string status)
    {
        return await _dbSet
            .Include(t => t.Project)
            .Include(t => t.User)
            .Where(t => t.Status == status)
            .OrderByDescending(t => t.SubmittedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Timesheet>> GetTimesheetsByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _dbSet
            .Include(t => t.Project)
            .Include(t => t.User)
            .Where(t => t.Date >= startDate && t.Date <= endDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Timesheet>> GetTimesheetsByUserAndDateRangeAsync(int userId, DateTime startDate, DateTime endDate)
    {
        return await _dbSet
            .Include(t => t.Project)
            .Include(t => t.User)
            .Where(t => t.UserId == userId && t.Date >= startDate && t.Date <= endDate)
            .ToListAsync();
    }

    public async Task<bool> IsDuplicateTimesheetAsync(int userId, int projectId, DateTime date, int? excludeTimesheetId = null)
    {
        var query = _dbSet.Where(t => t.UserId == userId && t.ProjectId == projectId && t.Date.Date == date.Date);
        
        if (excludeTimesheetId.HasValue)
        {
            query = query.Where(t => t.Id != excludeTimesheetId.Value);
        }

        return await query.AnyAsync();
    }

    public async Task<decimal> GetTotalHoursByUserAndDateAsync(int userId, DateTime date)
    {
        return await _dbSet
            .Where(t => t.UserId == userId && t.Date.Date == date.Date)
            .SumAsync(t => t.HoursWorked);
    }

    public async Task<IEnumerable<Timesheet>> GetPendingTimesheetsAsync()
    {
        return await _dbSet
            .Include(t => t.Project)
            .Include(t => t.User)
            .Where(t => t.Status == "Submitted")
            .OrderBy(t => t.SubmittedAt)
            .ToListAsync();
    }
}
