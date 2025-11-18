using FluentValidation;
using ProjectManagement.Application.DTOs.Task;

namespace ProjectManagement.Application.Validation.Task;

public class UpdateTaskDtoValidator : AbstractValidator<UpdateTaskDto>
{
    public UpdateTaskDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Task title is required")
            .MaximumLength(200).WithMessage("Task title must not exceed 200 characters");
    }
}

