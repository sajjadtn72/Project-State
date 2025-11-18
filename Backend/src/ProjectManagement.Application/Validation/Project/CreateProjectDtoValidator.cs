using FluentValidation;
using ProjectManagement.Application.DTOs.Project;

namespace ProjectManagement.Application.Validation.Project;

public class CreateProjectDtoValidator : AbstractValidator<CreateProjectDto>
{
    public CreateProjectDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Project name is required")
            .MaximumLength(200).WithMessage("Project name must not exceed 200 characters");

        RuleFor(x => x.TeamId)
            .NotEmpty().WithMessage("Team is required");
    }
}

