using ProjectManagement.Application.DTOs.Auth;
using ProjectManagement.Application.DTOs.User;

namespace ProjectManagement.Application.Interfaces.Services;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllUsersAsync(CancellationToken cancellationToken = default);
    Task<UserDto?> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<UserDto> CreatePersonnelAsync(CreatePersonnelDto createPersonnelDto, CancellationToken cancellationToken = default);
}

