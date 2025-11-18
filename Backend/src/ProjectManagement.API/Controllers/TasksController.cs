using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManagement.Application.DTOs.Task;
using ProjectManagement.Application.Interfaces.Services;

namespace ProjectManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllTasks(CancellationToken cancellationToken)
    {
        var tasks = await _taskService.GetAllTasksAsync(cancellationToken);
        return Ok(tasks);
    }

    [HttpGet("project/{projectId}")]
    public async Task<IActionResult> GetTasksByProjectId(Guid projectId, CancellationToken cancellationToken)
    {
        var tasks = await _taskService.GetTasksByProjectIdAsync(projectId, cancellationToken);
        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTaskById(Guid id, CancellationToken cancellationToken)
    {
        var task = await _taskService.GetTaskByIdAsync(id, cancellationToken);
        if (task == null)
        {
            return NotFound();
        }
        return Ok(task);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto createTaskDto, CancellationToken cancellationToken)
    {
        var task = await _taskService.CreateTaskAsync(createTaskDto, cancellationToken);
        return CreatedAtAction(nameof(GetTaskById), new { id = task.Id }, task);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(Guid id, [FromBody] UpdateTaskDto updateTaskDto, CancellationToken cancellationToken)
    {
        var task = await _taskService.UpdateTaskAsync(id, updateTaskDto, cancellationToken);
        return Ok(task);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteTask(Guid id, CancellationToken cancellationToken)
    {
        await _taskService.DeleteTaskAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateTaskStatus(Guid id, [FromBody] UpdateStatusDto statusDto, CancellationToken cancellationToken)
    {
        var task = await _taskService.UpdateTaskStatusAsync(id, statusDto.Status, cancellationToken);
        return Ok(task);
    }

    [HttpPatch("{id}/assign/{userId}")]
    public async Task<IActionResult> AssignTaskToUser(Guid id, Guid userId, CancellationToken cancellationToken)
    {
        var task = await _taskService.AssignTaskToUserAsync(id, userId, cancellationToken);
        return Ok(task);
    }
}

