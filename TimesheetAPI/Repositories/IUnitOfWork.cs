namespace TimesheetAPI.Repositories;

public interface IUnitOfWork : IDisposable
{
    IRepository<Models.User> Users { get; }
    IRepository<Models.Project> Projects { get; }
    IProjectAssignmentRepository ProjectAssignments { get; }
    ITimesheetRepository Timesheets { get; }
    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
