using AutoMapper;
using TimesheetAPI.DTOs;
using TimesheetAPI.Models;
using TimesheetAPI.Repositories;

namespace TimesheetAPI.Services;

public interface IProjectService
{
    Task<IEnumerable<ProjectDto>> GetAllProjectsAsync();
    Task<IEnumerable<ProjectDto>> GetActiveProjectsAsync();
    Task<ProjectDto?> GetProjectByIdAsync(int id);
    Task<ProjectDto> CreateProjectAsync(CreateProjectDto dto);
    Task<ProjectDto> UpdateProjectAsync(int id, UpdateProjectDto dto);
    Task DeactivateProjectAsync(int id);
    Task ActivateProjectAsync(int id);
}

public class ProjectService : IProjectService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ProjectService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ProjectDto>> GetAllProjectsAsync()
    {
        var projects = await _unitOfWork.Projects.GetAllAsync();
        return _mapper.Map<IEnumerable<ProjectDto>>(projects);
    }

    public async Task<IEnumerable<ProjectDto>> GetActiveProjectsAsync()
    {
        var projects = await _unitOfWork.Projects.FindAsync(p => p.IsActive);
        return _mapper.Map<IEnumerable<ProjectDto>>(projects);
    }

    public async Task<ProjectDto?> GetProjectByIdAsync(int id)
    {
        var project = await _unitOfWork.Projects.GetByIdAsync(id);
        return project == null ? null : _mapper.Map<ProjectDto>(project);
    }

    public async Task<ProjectDto> CreateProjectAsync(CreateProjectDto dto)
    {
        var exists = await _unitOfWork.Projects.AnyAsync(p => p.ProjectCode == dto.ProjectCode);
        if (exists)
            throw new InvalidOperationException($"Project code '{dto.ProjectCode}' already exists.");

        var project = _mapper.Map<Project>(dto);
        project.IsActive = true;
        project.CreatedAt = DateTime.UtcNow;

        await _unitOfWork.Projects.AddAsync(project);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<ProjectDto>(project);
    }

    public async Task<ProjectDto> UpdateProjectAsync(int id, UpdateProjectDto dto)
    {
        var project = await _unitOfWork.Projects.GetByIdAsync(id);
        if (project == null)
            throw new InvalidOperationException("Project not found.");

        project.ProjectName = dto.ProjectName;
        project.ClientName = dto.ClientName;
        project.IsBillable = dto.IsBillable;
        project.IsActive = dto.IsActive;
        project.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Projects.Update(project);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<ProjectDto>(project);
    }

    public async Task DeactivateProjectAsync(int id)
    {
        var project = await _unitOfWork.Projects.GetByIdAsync(id);
        if (project == null)
            throw new InvalidOperationException("Project not found.");

        project.IsActive = false;
        project.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Projects.Update(project);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task ActivateProjectAsync(int id)
    {
        var project = await _unitOfWork.Projects.GetByIdAsync(id);
        if (project == null)
            throw new InvalidOperationException("Project not found.");

        project.IsActive = true;
        project.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Projects.Update(project);
        await _unitOfWork.SaveChangesAsync();
    }
}
