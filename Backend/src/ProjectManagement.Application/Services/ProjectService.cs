using AutoMapper;
using Microsoft.Extensions.Logging;
using ProjectManagement.Application.DTOs.Project;
using ProjectManagement.Application.Interfaces;
using ProjectManagement.Application.Interfaces.Services;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Enums;

namespace ProjectManagement.Application.Services;

public class ProjectService : IProjectService
{
    private readonly IRepository<Project> _projectRepository;
    private readonly IRepository<Team> _teamRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<ProjectService> _logger;

    public ProjectService(
        IRepository<Project> projectRepository,
        IRepository<Team> teamRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<ProjectService> logger)
    {
        _projectRepository = projectRepository;
        _teamRepository = teamRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<ProjectDto>> GetAllProjectsAsync(CancellationToken cancellationToken = default)
    {
        var projects = await _projectRepository.GetAllAsync(cancellationToken);
        return _mapper.Map<IEnumerable<ProjectDto>>(projects);
    }

    public async Task<ProjectDto?> GetProjectByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var project = await _projectRepository.GetByIdAsync(id, cancellationToken);
        return project != null ? _mapper.Map<ProjectDto>(project) : null;
    }

    public async Task<ProjectDto> CreateProjectAsync(CreateProjectDto createProjectDto, CancellationToken cancellationToken = default)
    {
        var team = await _teamRepository.GetByIdAsync(createProjectDto.TeamId, cancellationToken);
        if (team == null)
        {
            throw new KeyNotFoundException($"Team with ID {createProjectDto.TeamId} not found");
        }

        var project = _mapper.Map<Project>(createProjectDto);
        project.Id = Guid.NewGuid();
        project.Status = ProjectStatus.NotStarted;

        await _projectRepository.AddAsync(project, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<ProjectDto>(project);
    }

    public async Task<ProjectDto> UpdateProjectAsync(Guid id, UpdateProjectDto updateProjectDto, CancellationToken cancellationToken = default)
    {
        var project = await _projectRepository.GetByIdAsync(id, cancellationToken);
        if (project == null)
        {
            throw new KeyNotFoundException($"Project with ID {id} not found");
        }

        var team = await _teamRepository.GetByIdAsync(updateProjectDto.TeamId, cancellationToken);
        if (team == null)
        {
            throw new KeyNotFoundException($"Team with ID {updateProjectDto.TeamId} not found");
        }

        _mapper.Map(updateProjectDto, project);

        await _projectRepository.UpdateAsync(project, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<ProjectDto>(project);
    }

    public async Task DeleteProjectAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var project = await _projectRepository.GetByIdAsync(id, cancellationToken);
        if (project == null)
        {
            throw new KeyNotFoundException($"Project with ID {id} not found");
        }

        await _projectRepository.DeleteAsync(project, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<ProjectDto> UpdateProjectStatusAsync(Guid id, string status, CancellationToken cancellationToken = default)
    {
        var project = await _projectRepository.GetByIdAsync(id, cancellationToken);
        if (project == null)
        {
            throw new KeyNotFoundException($"Project with ID {id} not found");
        }

        if (Enum.TryParse<ProjectStatus>(status, true, out var projectStatus))
        {
            project.Status = projectStatus;
            await _projectRepository.UpdateAsync(project, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return _mapper.Map<ProjectDto>(project);
    }
}

