using AutoMapper;
using ProjectManagement.Application.DTOs.Auth;
using ProjectManagement.Application.DTOs.Dashboard;
using ProjectManagement.Application.DTOs.Project;
using ProjectManagement.Application.DTOs.Task;
using ProjectManagement.Application.DTOs.Team;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Enums;

namespace ProjectManagement.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Auth mappings
        CreateMap<User, DTOs.Auth.UserDto>()
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()));

        // Team mappings
        CreateMap<Team, TeamDto>()
            .ForMember(dest => dest.Members, opt => opt.MapFrom(src => 
                src.UserTeams.Select(ut => ut.User)));

        CreateMap<User, DTOs.Team.UserDto>()
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()));

        CreateMap<CreateTeamDto, Team>();
        CreateMap<UpdateTeamDto, Team>();

        // Project mappings
        CreateMap<Project, ProjectDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.TeamName, opt => opt.MapFrom(src => src.Team.Name))
            .ForMember(dest => dest.TaskCount, opt => opt.MapFrom(src => src.Tasks.Count));

        CreateMap<CreateProjectDto, Project>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => ProjectStatus.NotStarted));

        CreateMap<UpdateProjectDto, Project>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => 
                Enum.Parse<ProjectStatus>(src.Status)));

        // Task mappings
        CreateMap<ProjectTask, TaskDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.ProjectName, opt => opt.MapFrom(src => src.Project.Name))
            .ForMember(dest => dest.AssignedToName, opt => opt.MapFrom(src => 
                src.AssignedUser != null ? src.AssignedUser.FullName : null));

        CreateMap<CreateTaskDto, ProjectTask>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => ProjectManagement.Domain.Enums.TaskStatus.Todo));

        CreateMap<UpdateTaskDto, ProjectTask>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => 
                Enum.Parse<ProjectManagement.Domain.Enums.TaskStatus>(src.Status)))
            .ForMember(dest => dest.ProjectId, opt => opt.Ignore());
    }
}

