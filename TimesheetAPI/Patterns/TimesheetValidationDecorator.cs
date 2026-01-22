using TimesheetAPI.DTOs;
using TimesheetAPI.Repositories;

namespace TimesheetAPI.Patterns;

// Decorator Pattern for Timesheet Validation
public interface ITimesheetValidator
{
    Task<(bool IsValid, string ErrorMessage)> ValidateAsync(CreateTimesheetDto dto, int userId);
    Task<(bool IsValid, string ErrorMessage)> ValidateUpdateAsync(UpdateTimesheetDto dto, int timesheetId, int userId);
}

public class BaseTimesheetValidator : ITimesheetValidator
{
    public virtual Task<(bool IsValid, string ErrorMessage)> ValidateAsync(CreateTimesheetDto dto, int userId)
    {
        if (dto.HoursWorked <= 0 || dto.HoursWorked > 24)
        {
            return Task.FromResult((false, "Hours worked must be between 0.1 and 24."));
        }

        if (string.IsNullOrWhiteSpace(dto.Description))
        {
            return Task.FromResult((false, "Description is required."));
        }

        return Task.FromResult((true, string.Empty));
    }

    public virtual Task<(bool IsValid, string ErrorMessage)> ValidateUpdateAsync(UpdateTimesheetDto dto, int timesheetId, int userId)
    {
        if (dto.HoursWorked <= 0 || dto.HoursWorked > 24)
        {
            return Task.FromResult((false, "Hours worked must be between 0.1 and 24."));
        }

        if (string.IsNullOrWhiteSpace(dto.Description))
        {
            return Task.FromResult((false, "Description is required."));
        }

        return Task.FromResult((true, string.Empty));
    }
}

public class DuplicateCheckDecorator : ITimesheetValidator
{
    private readonly ITimesheetValidator _validator;
    private readonly IUnitOfWork _unitOfWork;

    public DuplicateCheckDecorator(ITimesheetValidator validator, IUnitOfWork unitOfWork)
    {
        _validator = validator;
        _unitOfWork = unitOfWork;
    }

    public async Task<(bool IsValid, string ErrorMessage)> ValidateAsync(CreateTimesheetDto dto, int userId)
    {
        var baseResult = await _validator.ValidateAsync(dto, userId);
        if (!baseResult.IsValid)
            return baseResult;

        var isDuplicate = await _unitOfWork.Timesheets
            .IsDuplicateTimesheetAsync(userId, dto.ProjectId, dto.Date);

        if (isDuplicate)
        {
            return (false, "A timesheet entry already exists for this project and date.");
        }

        return (true, string.Empty);
    }

    public async Task<(bool IsValid, string ErrorMessage)> ValidateUpdateAsync(UpdateTimesheetDto dto, int timesheetId, int userId)
    {
        var baseResult = await _validator.ValidateUpdateAsync(dto, timesheetId, userId);
        if (!baseResult.IsValid)
            return baseResult;

        var isDuplicate = await _unitOfWork.Timesheets
            .IsDuplicateTimesheetAsync(userId, dto.ProjectId, dto.Date, timesheetId);

        if (isDuplicate)
        {
            return (false, "A timesheet entry already exists for this project and date.");
        }

        return (true, string.Empty);
    }
}

public class DailyHoursLimitDecorator : ITimesheetValidator
{
    private readonly ITimesheetValidator _validator;
    private readonly IUnitOfWork _unitOfWork;

    public DailyHoursLimitDecorator(ITimesheetValidator validator, IUnitOfWork unitOfWork)
    {
        _validator = validator;
        _unitOfWork = unitOfWork;
    }

    public async Task<(bool IsValid, string ErrorMessage)> ValidateAsync(CreateTimesheetDto dto, int userId)
    {
        var baseResult = await _validator.ValidateAsync(dto, userId);
        if (!baseResult.IsValid)
            return baseResult;

        var totalHours = await _unitOfWork.Timesheets
            .GetTotalHoursByUserAndDateAsync(userId, dto.Date);

        if (totalHours + dto.HoursWorked > 24)
        {
            return (false, $"Total hours for the day cannot exceed 24. Current total: {totalHours} hours.");
        }

        return (true, string.Empty);
    }

    public async Task<(bool IsValid, string ErrorMessage)> ValidateUpdateAsync(UpdateTimesheetDto dto, int timesheetId, int userId)
    {
        var baseResult = await _validator.ValidateUpdateAsync(dto, timesheetId, userId);
        if (!baseResult.IsValid)
            return baseResult;

        var timesheet = await _unitOfWork.Timesheets.GetByIdAsync(timesheetId);
        if (timesheet == null)
            return (false, "Timesheet not found.");

        var totalHours = await _unitOfWork.Timesheets
            .GetTotalHoursByUserAndDateAsync(userId, dto.Date);

        // Subtract the current timesheet hours if the date hasn't changed
        if (timesheet.Date.Date == dto.Date.Date)
        {
            totalHours -= timesheet.HoursWorked;
        }

        if (totalHours + dto.HoursWorked > 24)
        {
            return (false, $"Total hours for the day cannot exceed 24. Current total: {totalHours} hours.");
        }

        return (true, string.Empty);
    }
}

public class ProjectAssignmentDecorator : ITimesheetValidator
{
    private readonly ITimesheetValidator _validator;
    private readonly IUnitOfWork _unitOfWork;

    public ProjectAssignmentDecorator(ITimesheetValidator validator, IUnitOfWork unitOfWork)
    {
        _validator = validator;
        _unitOfWork = unitOfWork;
    }

    public async Task<(bool IsValid, string ErrorMessage)> ValidateAsync(CreateTimesheetDto dto, int userId)
    {
        var baseResult = await _validator.ValidateAsync(dto, userId);
        if (!baseResult.IsValid)
            return baseResult;

        var isAssigned = await _unitOfWork.ProjectAssignments
            .IsUserAssignedToProjectAsync(userId, dto.ProjectId, dto.Date);

        if (!isAssigned)
        {
            return (false, "You are not assigned to this project for the specified date.");
        }

        return (true, string.Empty);
    }

    public async Task<(bool IsValid, string ErrorMessage)> ValidateUpdateAsync(UpdateTimesheetDto dto, int timesheetId, int userId)
    {
        var baseResult = await _validator.ValidateUpdateAsync(dto, timesheetId, userId);
        if (!baseResult.IsValid)
            return baseResult;

        var isAssigned = await _unitOfWork.ProjectAssignments
            .IsUserAssignedToProjectAsync(userId, dto.ProjectId, dto.Date);

        if (!isAssigned)
        {
            return (false, "You are not assigned to this project for the specified date.");
        }

        return (true, string.Empty);
    }
}
