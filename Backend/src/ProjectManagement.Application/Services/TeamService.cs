using AutoMapper;
using Microsoft.Extensions.Logging;
using ProjectManagement.Application.DTOs.Team;
using ProjectManagement.Application.Interfaces;
using ProjectManagement.Application.Interfaces.Services;
using ProjectManagement.Domain.Entities;

namespace ProjectManagement.Application.Services;

public class TeamService : ITeamService
{
    private readonly IRepository<Team> _teamRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<UserTeam> _userTeamRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<TeamService> _logger;

    public TeamService(
        IRepository<Team> teamRepository,
        IRepository<User> userRepository,
        IRepository<UserTeam> userTeamRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<TeamService> logger)
    {
        _teamRepository = teamRepository;
        _userRepository = userRepository;
        _userTeamRepository = userTeamRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<TeamDto>> GetAllTeamsAsync(CancellationToken cancellationToken = default)
    {
        var teams = await _teamRepository.GetAllAsync(cancellationToken);
        return _mapper.Map<IEnumerable<TeamDto>>(teams);
    }

    public async Task<TeamDto?> GetTeamByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var team = await _teamRepository.GetByIdAsync(id, cancellationToken);
        return team != null ? _mapper.Map<TeamDto>(team) : null;
    }

    public async Task<TeamDto> CreateTeamAsync(CreateTeamDto createTeamDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating new team: {TeamName}", createTeamDto.Name);

        var team = _mapper.Map<Team>(createTeamDto);
        team.Id = Guid.NewGuid();
        team.CreatedAt = DateTime.UtcNow;

        await _teamRepository.AddAsync(team, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Team created successfully: {TeamId}", team.Id);

        return _mapper.Map<TeamDto>(team);
    }

    public async Task<TeamDto> UpdateTeamAsync(Guid id, UpdateTeamDto updateTeamDto, CancellationToken cancellationToken = default)
    {
        var team = await _teamRepository.GetByIdAsync(id, cancellationToken);
        if (team == null)
        {
            throw new KeyNotFoundException($"Team with ID {id} not found");
        }

        team.Name = updateTeamDto.Name;
        team.Description = updateTeamDto.Description;

        await _teamRepository.UpdateAsync(team, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<TeamDto>(team);
    }

    public async Task DeleteTeamAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var team = await _teamRepository.GetByIdAsync(id, cancellationToken);
        if (team == null)
        {
            throw new KeyNotFoundException($"Team with ID {id} not found");
        }

        await _teamRepository.DeleteAsync(team, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task AddMemberToTeamAsync(Guid teamId, Guid userId, CancellationToken cancellationToken = default)
    {
        var team = await _teamRepository.GetByIdAsync(teamId, cancellationToken);
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);

        if (team == null)
        {
            throw new KeyNotFoundException($"Team with ID {teamId} not found");
        }

        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {userId} not found");
        }

        var existingUserTeam = (await _userTeamRepository.FindAsync(
            ut => ut.UserId == userId && ut.TeamId == teamId, cancellationToken)).FirstOrDefault();

        if (existingUserTeam != null)
        {
            return;
        }

        var userTeam = new UserTeam
        {
            UserId = userId,
            TeamId = teamId,
            User = user,
            Team = team
        };

        await _userTeamRepository.AddAsync(userTeam, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveMemberFromTeamAsync(Guid teamId, Guid userId, CancellationToken cancellationToken = default)
    {
        var userTeam = (await _userTeamRepository.FindAsync(
            ut => ut.UserId == userId && ut.TeamId == teamId, cancellationToken)).FirstOrDefault();

        if (userTeam != null)
        {
            await _userTeamRepository.DeleteAsync(userTeam, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}

