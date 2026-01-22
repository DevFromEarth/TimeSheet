using TimesheetAPI.Models;

namespace TimesheetAPI.Repositories;

public interface ITimesheetRepository : IRepository<Timesheet>
{
    Task<IEnumerable<Timesheet>> GetTimesheetsByUserIdAsync(int userId);
    Task<IEnumerable<Timesheet>> GetTimesheetsByStatusAsync(string status);
    Task<IEnumerable<Timesheet>> GetTimesheetsByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<Timesheet>> GetTimesheetsByUserAndDateRangeAsync(int userId, DateTime startDate, DateTime endDate);
    Task<bool> IsDuplicateTimesheetAsync(int userId, int projectId, DateTime date, int? excludeTimesheetId = null);
    Task<decimal> GetTotalHoursByUserAndDateAsync(int userId, DateTime date);
    Task<IEnumerable<Timesheet>> GetPendingTimesheetsAsync();
}
