namespace ProjectManagement.Domain.Entities;

public class Team
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public ICollection<UserTeam> UserTeams { get; set; } = new List<UserTeam>();
    public ICollection<Project> Projects { get; set; } = new List<Project>();
}

