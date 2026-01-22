using TimesheetAPI.DTOs;

namespace TimesheetAPI.Patterns;

public interface IApprovalStrategy
{
    Task<bool> CanApproveAsync(int timesheetId, int approverId);
    string GetStrategyName();
}

public class ManagerApprovalStrategy : IApprovalStrategy
{
    private readonly Repositories.IUnitOfWork _unitOfWork;

    public ManagerApprovalStrategy(Repositories.IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> CanApproveAsync(int timesheetId, int approverId)
    {
        var approver = await _unitOfWork.Users.GetByIdAsync(approverId);
        if (approver == null || approver.Role != "Manager")
            return false;

        var timesheet = await _unitOfWork.Timesheets.GetByIdAsync(timesheetId);
        if (timesheet == null || timesheet.Status != "Submitted")
            return false;

        // Manager cannot approve their own timesheets
        return timesheet.UserId != approverId;
    }

    public string GetStrategyName() => "ManagerApproval";
}

public class ApprovalContext
{
    private IApprovalStrategy _strategy;

    public ApprovalContext(IApprovalStrategy strategy)
    {
        _strategy = strategy;
    }

    public void SetStrategy(IApprovalStrategy strategy)
    {
        _strategy = strategy;
    }

    public async Task<bool> CanApproveAsync(int timesheetId, int approverId)
    {
        return await _strategy.CanApproveAsync(timesheetId, approverId);
    }
}
