using ProjectManagement.Domain.Enums;

namespace ProjectManagement.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string? JobRole { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public ICollection<UserTeam> UserTeams { get; set; } = new List<UserTeam>();
    public ICollection<ProjectTask> AssignedTasks { get; set; } = new List<ProjectTask>();
}

