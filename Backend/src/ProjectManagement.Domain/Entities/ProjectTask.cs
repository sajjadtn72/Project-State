using ProjectManagement.Domain.Enums;

namespace ProjectManagement.Domain.Entities;

public class ProjectTask
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskStatus Status { get; set; }
    public Guid? AssignedTo { get; set; }
    public DateTime? DueDate { get; set; }

    // Navigation properties
    public Project Project { get; set; } = null!;
    public User? AssignedUser { get; set; }
}

