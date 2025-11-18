using AutoMapper;
using ProjectManagement.Application.DTOs.Auth;
using ProjectManagement.Application.Interfaces;
using ProjectManagement.Application.Interfaces.Services;

namespace ProjectManagement.Application.Services;

public class UserService : IUserService
{
    private readonly IRepository<Domain.Entities.User> _userRepository;
    private readonly IMapper _mapper;

    public UserService(IRepository<Domain.Entities.User> userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync(CancellationToken cancellationToken = default)
    {
        var users = await _userRepository.GetAllAsync(cancellationToken);
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        return user != null ? _mapper.Map<UserDto>(user) : null;
    }
}

