using ProjectManagement.Application.DTOs.Team;

namespace ProjectManagement.Application.Interfaces.Services;

public interface ITeamService
{
    Task<IEnumerable<TeamDto>> GetAllTeamsAsync(CancellationToken cancellationToken = default);
    Task<TeamDto?> GetTeamByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TeamDto> CreateTeamAsync(CreateTeamDto createTeamDto, CancellationToken cancellationToken = default);
    Task<TeamDto> UpdateTeamAsync(Guid id, UpdateTeamDto updateTeamDto, CancellationToken cancellationToken = default);
    Task DeleteTeamAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddMemberToTeamAsync(Guid teamId, Guid userId, CancellationToken cancellationToken = default);
    Task RemoveMemberFromTeamAsync(Guid teamId, Guid userId, CancellationToken cancellationToken = default);
}

