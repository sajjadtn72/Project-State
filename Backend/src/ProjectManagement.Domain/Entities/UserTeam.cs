namespace ProjectManagement.Domain.Entities;

public class UserTeam
{
    public Guid UserId { get; set; }
    public Guid TeamId { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Team Team { get; set; } = null!;
}

