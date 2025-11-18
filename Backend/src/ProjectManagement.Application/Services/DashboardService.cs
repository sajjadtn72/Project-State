using Microsoft.Extensions.Logging;
using ProjectManagement.Application.DTOs.Dashboard;
using ProjectManagement.Application.Interfaces;
using ProjectManagement.Application.Interfaces.Services;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Enums;

namespace ProjectManagement.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IRepository<Team> _teamRepository;
    private readonly IRepository<Project> _projectRepository;
    private readonly IRepository<ProjectTask> _taskRepository;
    private readonly ILogger<DashboardService> _logger;

    public DashboardService(
        IRepository<Team> teamRepository,
        IRepository<Project> projectRepository,
        IRepository<ProjectTask> taskRepository,
        ILogger<DashboardService> logger)
    {
        _teamRepository = teamRepository;
        _projectRepository = projectRepository;
        _taskRepository = taskRepository;
        _logger = logger;
    }

    public async Task<DashboardDto> GetDashboardDataAsync(CancellationToken cancellationToken = default)
    {
        var teams = (await _teamRepository.GetAllAsync(cancellationToken)).ToList();
        var projects = (await _projectRepository.GetAllAsync(cancellationToken)).ToList();
        var tasks = (await _taskRepository.GetAllAsync(cancellationToken)).ToList();

        var dashboard = new DashboardDto
        {
            TotalTeams = teams.Count,
            TotalProjects = projects.Count,
            ProjectsNotStarted = projects.Count(p => p.Status == ProjectStatus.NotStarted),
            ProjectsInProgress = projects.Count(p => p.Status == ProjectStatus.InProgress),
            ProjectsInReview = projects.Count(p => p.Status == ProjectStatus.Review),
            ProjectsCompleted = projects.Count(p => p.Status == ProjectStatus.Completed)
        };

        var activities = new List<RecentActivityDto>();

        foreach (var project in projects.OrderByDescending(p => p.StartDate ?? p.Id).Take(5))
        {
            activities.Add(new RecentActivityDto
            {
                Type = "Project",
                Description = $"Project '{project.Name}' - {project.Status}",
                CreatedAt = project.StartDate ?? DateTime.UtcNow
            });
        }

        foreach (var task in tasks.OrderByDescending(t => t.DueDate ?? t.Id).Take(5))
        {
            activities.Add(new RecentActivityDto
            {
                Type = "Task",
                Description = $"Task '{task.Title}' - {task.Status}",
                CreatedAt = task.DueDate ?? DateTime.UtcNow
            });
        }

        dashboard.RecentActivities = activities
            .OrderByDescending(a => a.CreatedAt)
            .Take(10)
            .ToList();

        return dashboard;
    }
}

