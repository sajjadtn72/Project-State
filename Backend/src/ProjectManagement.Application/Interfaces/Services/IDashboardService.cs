using ProjectManagement.Application.DTOs.Dashboard;

namespace ProjectManagement.Application.Interfaces.Services;

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardDataAsync(CancellationToken cancellationToken = default);
}

