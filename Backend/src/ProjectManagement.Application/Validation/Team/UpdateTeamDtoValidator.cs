using FluentValidation;
using ProjectManagement.Application.DTOs.Team;

namespace ProjectManagement.Application.Validation.Team;

public class UpdateTeamDtoValidator : AbstractValidator<UpdateTeamDto>
{
    public UpdateTeamDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Team name is required")
            .MaximumLength(200).WithMessage("Team name must not exceed 200 characters");
    }
}

