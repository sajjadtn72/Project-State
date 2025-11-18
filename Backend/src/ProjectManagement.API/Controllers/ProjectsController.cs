using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManagement.Application.DTOs.Project;
using ProjectManagement.Application.Interfaces.Services;

namespace ProjectManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllProjects(CancellationToken cancellationToken)
    {
        var projects = await _projectService.GetAllProjectsAsync(cancellationToken);
        return Ok(projects);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProjectById(Guid id, CancellationToken cancellationToken)
    {
        var project = await _projectService.GetProjectByIdAsync(id, cancellationToken);
        if (project == null)
        {
            return NotFound();
        }
        return Ok(project);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectDto createProjectDto, CancellationToken cancellationToken)
    {
        var project = await _projectService.CreateProjectAsync(createProjectDto, cancellationToken);
        return CreatedAtAction(nameof(GetProjectById), new { id = project.Id }, project);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateProject(Guid id, [FromBody] UpdateProjectDto updateProjectDto, CancellationToken cancellationToken)
    {
        var project = await _projectService.UpdateProjectAsync(id, updateProjectDto, cancellationToken);
        return Ok(project);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteProject(Guid id, CancellationToken cancellationToken)
    {
        await _projectService.DeleteProjectAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateProjectStatus(Guid id, [FromBody] UpdateStatusDto statusDto, CancellationToken cancellationToken)
    {
        var project = await _projectService.UpdateProjectStatusAsync(id, statusDto.Status, cancellationToken);
        return Ok(project);
    }
}

public class UpdateStatusDto
{
    public string Status { get; set; } = string.Empty;
}

