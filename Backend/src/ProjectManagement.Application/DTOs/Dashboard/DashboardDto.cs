namespace ProjectManagement.Application.DTOs.Dashboard;

public class DashboardDto
{
    public int TotalTeams { get; set; }
    public int TotalProjects { get; set; }
    public int ProjectsNotStarted { get; set; }
    public int ProjectsInProgress { get; set; }
    public int ProjectsInReview { get; set; }
    public int ProjectsCompleted { get; set; }
    public List<RecentActivityDto> RecentActivities { get; set; } = new();
}

public class RecentActivityDto
{
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

