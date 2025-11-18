using ProjectManagement.Application.DTOs.Project;

namespace ProjectManagement.Application.Interfaces.Services;

public interface IProjectService
{
    Task<IEnumerable<ProjectDto>> GetAllProjectsAsync(CancellationToken cancellationToken = default);
    Task<ProjectDto?> GetProjectByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ProjectDto> CreateProjectAsync(CreateProjectDto createProjectDto, CancellationToken cancellationToken = default);
    Task<ProjectDto> UpdateProjectAsync(Guid id, UpdateProjectDto updateProjectDto, CancellationToken cancellationToken = default);
    Task DeleteProjectAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ProjectDto> UpdateProjectStatusAsync(Guid id, string status, CancellationToken cancellationToken = default);
}

