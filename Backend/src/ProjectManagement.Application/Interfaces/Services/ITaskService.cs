using ProjectManagement.Application.DTOs.Task;

namespace ProjectManagement.Application.Interfaces.Services;

public interface ITaskService
{
    Task<IEnumerable<TaskDto>> GetAllTasksAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<TaskDto>> GetTasksByProjectIdAsync(Guid projectId, CancellationToken cancellationToken = default);
    Task<TaskDto?> GetTaskByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TaskDto> CreateTaskAsync(CreateTaskDto createTaskDto, CancellationToken cancellationToken = default);
    Task<TaskDto> UpdateTaskAsync(Guid id, UpdateTaskDto updateTaskDto, CancellationToken cancellationToken = default);
    Task DeleteTaskAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TaskDto> UpdateTaskStatusAsync(Guid id, string status, CancellationToken cancellationToken = default);
    Task<TaskDto> AssignTaskToUserAsync(Guid taskId, Guid userId, CancellationToken cancellationToken = default);
}

