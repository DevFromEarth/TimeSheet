using Microsoft.EntityFrameworkCore.Storage;
using TimesheetAPI.Data;
using TimesheetAPI.Models;

namespace TimesheetAPI.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly TimesheetDbContext _context;
    private IDbContextTransaction? _transaction;

    public IRepository<User> Users { get; private set; }
    public IRepository<Project> Projects { get; private set; }
    public IProjectAssignmentRepository ProjectAssignments { get; private set; }
    public ITimesheetRepository Timesheets { get; private set; }

    public UnitOfWork(TimesheetDbContext context)
    {
        _context = context;
        Users = new Repository<User>(context);
        Projects = new Repository<Project>(context);
        ProjectAssignments = new ProjectAssignmentRepository(context);
        Timesheets = new TimesheetRepository(context);
    }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public async Task BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}
