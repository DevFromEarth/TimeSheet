using AutoMapper;
using TimesheetAPI.DTOs;
using TimesheetAPI.Models;

namespace TimesheetAPI.Data;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User mappings
        CreateMap<User, UserDto>();
        CreateMap<CreateUserDto, User>();

        // Project mappings
        CreateMap<Project, ProjectDto>();
        CreateMap<CreateProjectDto, Project>();
        CreateMap<UpdateProjectDto, Project>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // ProjectAssignment mappings
        CreateMap<ProjectAssignment, ProjectAssignmentDto>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.Name))
            .ForMember(dest => dest.ProjectCode, opt => opt.MapFrom(src => src.Project.ProjectCode))
            .ForMember(dest => dest.ProjectName, opt => opt.MapFrom(src => src.Project.ProjectName));
        CreateMap<CreateProjectAssignmentDto, ProjectAssignment>();
        CreateMap<UpdateProjectAssignmentDto, ProjectAssignment>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // Timesheet mappings
        CreateMap<Timesheet, TimesheetDto>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.Name))
            .ForMember(dest => dest.ProjectCode, opt => opt.MapFrom(src => src.Project.ProjectCode))
            .ForMember(dest => dest.ProjectName, opt => opt.MapFrom(src => src.Project.ProjectName));
        CreateMap<CreateTimesheetDto, Timesheet>();
        CreateMap<UpdateTimesheetDto, Timesheet>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
    }
}
