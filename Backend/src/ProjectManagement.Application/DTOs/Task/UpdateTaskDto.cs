namespace ProjectManagement.Application.DTOs.Task;

public class UpdateTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid? AssignedTo { get; set; }
    public DateTime? DueDate { get; set; }
}

