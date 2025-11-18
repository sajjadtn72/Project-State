namespace ProjectManagement.Application.DTOs.Task;

public class CreateTaskDto
{
    public Guid ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? AssignedTo { get; set; }
    public DateTime? DueDate { get; set; }
}

