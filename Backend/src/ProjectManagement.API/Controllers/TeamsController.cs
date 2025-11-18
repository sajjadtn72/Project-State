using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManagement.Application.DTOs.Team;
using ProjectManagement.Application.Interfaces.Services;

namespace ProjectManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TeamsController : ControllerBase
{
    private readonly ITeamService _teamService;

    public TeamsController(ITeamService teamService)
    {
        _teamService = teamService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllTeams(CancellationToken cancellationToken)
    {
        var teams = await _teamService.GetAllTeamsAsync(cancellationToken);
        return Ok(teams);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTeamById(Guid id, CancellationToken cancellationToken)
    {
        var team = await _teamService.GetTeamByIdAsync(id, cancellationToken);
        if (team == null)
        {
            return NotFound();
        }
        return Ok(team);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateTeam([FromBody] CreateTeamDto createTeamDto, CancellationToken cancellationToken)
    {
        var team = await _teamService.CreateTeamAsync(createTeamDto, cancellationToken);
        return CreatedAtAction(nameof(GetTeamById), new { id = team.Id }, team);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateTeam(Guid id, [FromBody] UpdateTeamDto updateTeamDto, CancellationToken cancellationToken)
    {
        var team = await _teamService.UpdateTeamAsync(id, updateTeamDto, cancellationToken);
        return Ok(team);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteTeam(Guid id, CancellationToken cancellationToken)
    {
        await _teamService.DeleteTeamAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPost("{teamId}/members")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddMember(Guid teamId, [FromBody] AddTeamMemberDto addMemberDto, CancellationToken cancellationToken)
    {
        await _teamService.AddMemberToTeamAsync(teamId, addMemberDto.UserId, cancellationToken);
        return Ok(new { message = "Member added successfully" });
    }

    [HttpDelete("{teamId}/members/{userId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemoveMember(Guid teamId, Guid userId, CancellationToken cancellationToken)
    {
        await _teamService.RemoveMemberFromTeamAsync(teamId, userId, cancellationToken);
        return Ok(new { message = "Member removed successfully" });
    }
}

