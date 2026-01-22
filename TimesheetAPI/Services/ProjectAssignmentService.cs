using AutoMapper;
using TimesheetAPI.DTOs;
using TimesheetAPI.Models;
using TimesheetAPI.Repositories;

namespace TimesheetAPI.Services;

public interface IProjectAssignmentService
{
    Task<IEnumerable<ProjectAssignmentDto>> GetUserAssignmentsAsync(int userId);
    Task<IEnumerable<ProjectAssignmentDto>> GetActiveUserAssignmentsAsync(int userId);
    Task<IEnumerable<ProjectAssignmentDto>> GetProjectAssignmentsAsync(int projectId);
    Task<ProjectAssignmentDto> CreateAssignmentAsync(CreateProjectAssignmentDto dto);
    Task<ProjectAssignmentDto> UpdateAssignmentAsync(int id, UpdateProjectAssignmentDto dto);
    Task DeleteAssignmentAsync(int id);
}

public class ProjectAssignmentService : IProjectAssignmentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ProjectAssignmentService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ProjectAssignmentDto>> GetUserAssignmentsAsync(int userId)
    {
        var assignments = await _unitOfWork.ProjectAssignments.GetAssignmentsByUserIdAsync(userId);
        return _mapper.Map<IEnumerable<ProjectAssignmentDto>>(assignments);
    }

    public async Task<IEnumerable<ProjectAssignmentDto>> GetActiveUserAssignmentsAsync(int userId)
    {
        var assignments = await _unitOfWork.ProjectAssignments
            .GetActiveAssignmentsByUserIdAsync(userId, DateTime.UtcNow);
        return _mapper.Map<IEnumerable<ProjectAssignmentDto>>(assignments);
    }

    public async Task<IEnumerable<ProjectAssignmentDto>> GetProjectAssignmentsAsync(int projectId)
    {
        var assignments = await _unitOfWork.ProjectAssignments.GetAssignmentsByProjectIdAsync(projectId);
        return _mapper.Map<IEnumerable<ProjectAssignmentDto>>(assignments);
    }

    public async Task<ProjectAssignmentDto> CreateAssignmentAsync(CreateProjectAssignmentDto dto)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(dto.UserId);
        if (user == null)
            throw new InvalidOperationException("User not found.");

        var project = await _unitOfWork.Projects.GetByIdAsync(dto.ProjectId);
        if (project == null)
            throw new InvalidOperationException("Project not found.");

        if (dto.EndDate.HasValue && dto.EndDate.Value < dto.StartDate)
            throw new InvalidOperationException("End date cannot be before start date.");

        var assignment = _mapper.Map<ProjectAssignment>(dto);
        assignment.IsActive = true;
        assignment.CreatedAt = DateTime.UtcNow;

        await _unitOfWork.ProjectAssignments.AddAsync(assignment);
        await _unitOfWork.SaveChangesAsync();

        var created = await _unitOfWork.ProjectAssignments.GetByIdAsync(assignment.Id);
        return _mapper.Map<ProjectAssignmentDto>(created);
    }

    public async Task<ProjectAssignmentDto> UpdateAssignmentAsync(int id, UpdateProjectAssignmentDto dto)
    {
        var assignment = await _unitOfWork.ProjectAssignments.GetByIdAsync(id);
        if (assignment == null)
            throw new InvalidOperationException("Assignment not found.");

        if (dto.EndDate.HasValue && dto.EndDate.Value < dto.StartDate)
            throw new InvalidOperationException("End date cannot be before start date.");

        assignment.StartDate = dto.StartDate;
        assignment.EndDate = dto.EndDate;
        assignment.IsActive = dto.IsActive;

        _unitOfWork.ProjectAssignments.Update(assignment);
        await _unitOfWork.SaveChangesAsync();

        var updated = await _unitOfWork.ProjectAssignments.GetByIdAsync(id);
        return _mapper.Map<ProjectAssignmentDto>(updated);
    }

    public async Task DeleteAssignmentAsync(int id)
    {
        var assignment = await _unitOfWork.ProjectAssignments.GetByIdAsync(id);
        if (assignment == null)
            throw new InvalidOperationException("Assignment not found.");

        _unitOfWork.ProjectAssignments.Remove(assignment);
        await _unitOfWork.SaveChangesAsync();
    }
}
