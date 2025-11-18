namespace ProjectManagement.Application.DTOs.Task;

public class TaskDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid? AssignedTo { get; set; }
    public string? AssignedToName { get; set; }
    public DateTime? DueDate { get; set; }
}

