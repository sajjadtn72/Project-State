using AutoMapper;
using Microsoft.Extensions.Logging;
using ProjectManagement.Application.DTOs.Task;
using ProjectManagement.Application.Interfaces;
using ProjectManagement.Application.Interfaces.Services;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Enums;

namespace ProjectManagement.Application.Services;

public class TaskService : ITaskService
{
    private readonly IRepository<ProjectTask> _taskRepository;
    private readonly IRepository<Project> _projectRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<TaskService> _logger;

    public TaskService(
        IRepository<ProjectTask> taskRepository,
        IRepository<Project> projectRepository,
        IRepository<User> userRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<TaskService> logger)
    {
        _taskRepository = taskRepository;
        _projectRepository = projectRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<TaskDto>> GetAllTasksAsync(CancellationToken cancellationToken = default)
    {
        var tasks = await _taskRepository.GetAllAsync(cancellationToken);
        return _mapper.Map<IEnumerable<TaskDto>>(tasks);
    }

    public async Task<IEnumerable<TaskDto>> GetTasksByProjectIdAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var tasks = (await _taskRepository.FindAsync(t => t.ProjectId == projectId, cancellationToken)).ToList();
        return _mapper.Map<IEnumerable<TaskDto>>(tasks);
    }

    public async Task<TaskDto?> GetTaskByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var task = await _taskRepository.GetByIdAsync(id, cancellationToken);
        return task != null ? _mapper.Map<TaskDto>(task) : null;
    }

    public async Task<TaskDto> CreateTaskAsync(CreateTaskDto createTaskDto, CancellationToken cancellationToken = default)
    {
        var project = await _projectRepository.GetByIdAsync(createTaskDto.ProjectId, cancellationToken);
        if (project == null)
        {
            throw new KeyNotFoundException($"Project with ID {createTaskDto.ProjectId} not found");
        }

        if (createTaskDto.AssignedTo.HasValue)
        {
            var user = await _userRepository.GetByIdAsync(createTaskDto.AssignedTo.Value, cancellationToken);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {createTaskDto.AssignedTo.Value} not found");
            }
        }

        var task = _mapper.Map<ProjectTask>(createTaskDto);
        task.Id = Guid.NewGuid();
        task.Status = TaskStatus.Todo;

        await _taskRepository.AddAsync(task, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<TaskDto>(task);
    }

    public async Task<TaskDto> UpdateTaskAsync(Guid id, UpdateTaskDto updateTaskDto, CancellationToken cancellationToken = default)
    {
        var task = await _taskRepository.GetByIdAsync(id, cancellationToken);
        if (task == null)
        {
            throw new KeyNotFoundException($"Task with ID {id} not found");
        }

        if (updateTaskDto.AssignedTo.HasValue)
        {
            var user = await _userRepository.GetByIdAsync(updateTaskDto.AssignedTo.Value, cancellationToken);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {updateTaskDto.AssignedTo.Value} not found");
            }
        }

        _mapper.Map(updateTaskDto, task);

        await _taskRepository.UpdateAsync(task, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<TaskDto>(task);
    }

    public async Task DeleteTaskAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var task = await _taskRepository.GetByIdAsync(id, cancellationToken);
        if (task == null)
        {
            throw new KeyNotFoundException($"Task with ID {id} not found");
        }

        await _taskRepository.DeleteAsync(task, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<TaskDto> UpdateTaskStatusAsync(Guid id, string status, CancellationToken cancellationToken = default)
    {
        var task = await _taskRepository.GetByIdAsync(id, cancellationToken);
        if (task == null)
        {
            throw new KeyNotFoundException($"Task with ID {id} not found");
        }

        if (Enum.TryParse<TaskStatus>(status, true, out var taskStatus))
        {
            task.Status = taskStatus;
            await _taskRepository.UpdateAsync(task, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return _mapper.Map<TaskDto>(task);
    }

    public async Task<TaskDto> AssignTaskToUserAsync(Guid taskId, Guid userId, CancellationToken cancellationToken = default)
    {
        var task = await _taskRepository.GetByIdAsync(taskId, cancellationToken);
        if (task == null)
        {
            throw new KeyNotFoundException($"Task with ID {taskId} not found");
        }

        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {userId} not found");
        }

        task.AssignedTo = userId;

        await _taskRepository.UpdateAsync(task, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<TaskDto>(task);
    }
}

