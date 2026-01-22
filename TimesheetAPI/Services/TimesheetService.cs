using AutoMapper;
using TimesheetAPI.DTOs;
using TimesheetAPI.Models;
using TimesheetAPI.Patterns;
using TimesheetAPI.Repositories;

namespace TimesheetAPI.Services;

public interface ITimesheetService
{
    Task<IEnumerable<TimesheetDto>> GetUserTimesheetsAsync(int userId);
    Task<TimesheetDto?> GetTimesheetByIdAsync(int id);
    Task<TimesheetDto> CreateTimesheetAsync(CreateTimesheetDto dto, int userId);
    Task<TimesheetDto> UpdateTimesheetAsync(int id, UpdateTimesheetDto dto, int userId);
    Task DeleteTimesheetAsync(int id, int userId);
    Task SubmitTimesheetsAsync(int[] timesheetIds, int userId);
    Task ApproveTimesheetAsync(int timesheetId, int approverId);
    Task RejectTimesheetAsync(int timesheetId, string comments, int approverId);
    Task<IEnumerable<TimesheetDto>> GetPendingTimesheetsAsync();
}

public class TimesheetService : ITimesheetService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ITimesheetValidator _validator;
    private readonly IApprovalStrategy _approvalStrategy;

    public TimesheetService(IUnitOfWork unitOfWork, IMapper mapper, IApprovalStrategy approvalStrategy)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _approvalStrategy = approvalStrategy;

        // Build decorator chain
        ITimesheetValidator baseValidator = new BaseTimesheetValidator();
        baseValidator = new DuplicateCheckDecorator(baseValidator, unitOfWork);
        baseValidator = new DailyHoursLimitDecorator(baseValidator, unitOfWork);
        baseValidator = new ProjectAssignmentDecorator(baseValidator, unitOfWork);
        _validator = baseValidator;
    }

    public async Task<IEnumerable<TimesheetDto>> GetUserTimesheetsAsync(int userId)
    {
        var timesheets = await _unitOfWork.Timesheets.GetTimesheetsByUserIdAsync(userId);
        return _mapper.Map<IEnumerable<TimesheetDto>>(timesheets);
    }

    public async Task<TimesheetDto?> GetTimesheetByIdAsync(int id)
    {
        var timesheet = await _unitOfWork.Timesheets.GetByIdAsync(id);
        return timesheet == null ? null : _mapper.Map<TimesheetDto>(timesheet);
    }

    public async Task<TimesheetDto> CreateTimesheetAsync(CreateTimesheetDto dto, int userId)
    {
        var validation = await _validator.ValidateAsync(dto, userId);
        if (!validation.IsValid)
            throw new InvalidOperationException(validation.ErrorMessage);

        var timesheet = _mapper.Map<Timesheet>(dto);
        timesheet.UserId = userId;
        timesheet.Status = "Draft";
        timesheet.CreatedAt = DateTime.UtcNow;

        await _unitOfWork.Timesheets.AddAsync(timesheet);
        await _unitOfWork.SaveChangesAsync();

        // Reload with navigation properties
        var created = await _unitOfWork.Timesheets.GetByIdAsync(timesheet.Id);
        return _mapper.Map<TimesheetDto>(created);
    }

    public async Task<TimesheetDto> UpdateTimesheetAsync(int id, UpdateTimesheetDto dto, int userId)
    {
        var timesheet = await _unitOfWork.Timesheets.GetByIdAsync(id);
        if (timesheet == null)
            throw new InvalidOperationException("Timesheet not found.");

        if (timesheet.UserId != userId)
            throw new UnauthorizedAccessException("You can only update your own timesheets.");

        if (timesheet.Status != "Draft")
            throw new InvalidOperationException("Only draft timesheets can be updated.");

        var validation = await _validator.ValidateUpdateAsync(dto, id, userId);
        if (!validation.IsValid)
            throw new InvalidOperationException(validation.ErrorMessage);

        timesheet.ProjectId = dto.ProjectId;
        timesheet.Date = dto.Date;
        timesheet.HoursWorked = dto.HoursWorked;
        timesheet.Description = dto.Description;

        _unitOfWork.Timesheets.Update(timesheet);
        await _unitOfWork.SaveChangesAsync();

        var updated = await _unitOfWork.Timesheets.GetByIdAsync(id);
        return _mapper.Map<TimesheetDto>(updated);
    }

    public async Task DeleteTimesheetAsync(int id, int userId)
    {
        var timesheet = await _unitOfWork.Timesheets.GetByIdAsync(id);
        if (timesheet == null)
            throw new InvalidOperationException("Timesheet not found.");

        if (timesheet.UserId != userId)
            throw new UnauthorizedAccessException("You can only delete your own timesheets.");

        if (timesheet.Status != "Draft")
            throw new InvalidOperationException("Only draft timesheets can be deleted.");

        _unitOfWork.Timesheets.Remove(timesheet);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task SubmitTimesheetsAsync(int[] timesheetIds, int userId)
    {
        foreach (var id in timesheetIds)
        {
            var timesheet = await _unitOfWork.Timesheets.GetByIdAsync(id);
            if (timesheet == null)
                throw new InvalidOperationException($"Timesheet {id} not found.");

            if (timesheet.UserId != userId)
                throw new UnauthorizedAccessException("You can only submit your own timesheets.");

            if (timesheet.Status != "Draft")
                throw new InvalidOperationException($"Timesheet {id} is not in draft status.");

            timesheet.Status = "Submitted";
            timesheet.SubmittedAt = DateTime.UtcNow;
            _unitOfWork.Timesheets.Update(timesheet);
        }

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task ApproveTimesheetAsync(int timesheetId, int approverId)
    {
        var canApprove = await _approvalStrategy.CanApproveAsync(timesheetId, approverId);
        if (!canApprove)
            throw new UnauthorizedAccessException("You are not authorized to approve this timesheet.");

        var timesheet = await _unitOfWork.Timesheets.GetByIdAsync(timesheetId);
        if (timesheet == null)
            throw new InvalidOperationException("Timesheet not found.");

        timesheet.Status = "Approved";
        timesheet.ApprovedAt = DateTime.UtcNow;
        timesheet.ApprovedBy = approverId;
        timesheet.RejectionComments = null;

        _unitOfWork.Timesheets.Update(timesheet);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task RejectTimesheetAsync(int timesheetId, string comments, int approverId)
    {
        if (string.IsNullOrWhiteSpace(comments))
            throw new InvalidOperationException("Rejection comments are mandatory.");

        var canApprove = await _approvalStrategy.CanApproveAsync(timesheetId, approverId);
        if (!canApprove)
            throw new UnauthorizedAccessException("You are not authorized to reject this timesheet.");

        var timesheet = await _unitOfWork.Timesheets.GetByIdAsync(timesheetId);
        if (timesheet == null)
            throw new InvalidOperationException("Timesheet not found.");

        timesheet.Status = "Rejected";
        timesheet.RejectionComments = comments;
        timesheet.ApprovedBy = approverId;
        timesheet.ApprovedAt = DateTime.UtcNow;

        _unitOfWork.Timesheets.Update(timesheet);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<IEnumerable<TimesheetDto>> GetPendingTimesheetsAsync()
    {
        var timesheets = await _unitOfWork.Timesheets.GetPendingTimesheetsAsync();
        return _mapper.Map<IEnumerable<TimesheetDto>>(timesheets);
    }
}
