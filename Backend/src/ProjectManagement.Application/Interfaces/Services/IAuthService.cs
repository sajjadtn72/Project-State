using ProjectManagement.Application.DTOs.Auth;

namespace ProjectManagement.Application.Interfaces.Services;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto, CancellationToken cancellationToken = default);
    Task<UserDto?> GetUserProfileAsync(Guid userId, CancellationToken cancellationToken = default);
}

