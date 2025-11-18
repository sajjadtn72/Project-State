using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManagement.Application.Interfaces.Services;

namespace ProjectManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboardData(CancellationToken cancellationToken)
    {
        var dashboard = await _dashboardService.GetDashboardDataAsync(cancellationToken);
        return Ok(dashboard);
    }
}

