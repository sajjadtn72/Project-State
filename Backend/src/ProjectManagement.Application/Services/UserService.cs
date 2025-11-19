using AutoMapper;
using ProjectManagement.Application.DTOs.Auth;
using ProjectManagement.Application.DTOs.User;
using ProjectManagement.Application.Interfaces;
using ProjectManagement.Application.Interfaces.Services;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Enums;

namespace ProjectManagement.Application.Services;

public class UserService : IUserService
{
    private readonly IRepository<Domain.Entities.User> _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UserService(IRepository<Domain.Entities.User> userRepository, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
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

    public async Task<UserDto> CreatePersonnelAsync(CreatePersonnelDto createPersonnelDto, CancellationToken cancellationToken = default)
    {
        // Generate a unique email based on full name
        var emailBase = createPersonnelDto.FullName.ToLower().Replace(" ", ".").Replace("آ", "a").Replace("ا", "a");
        var email = $"{emailBase}@personnel.local";
        
        // Check if email exists, if so add a number
        var existingUsers = await _userRepository.FindAsync(u => u.Email.StartsWith(email), cancellationToken);
        if (existingUsers.Any())
        {
            email = $"{emailBase}{existingUsers.Count()}@personnel.local";
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = createPersonnelDto.FullName,
            Email = email,
            JobRole = createPersonnelDto.JobRole,
            Role = UserRole.Member,
            PasswordHash = string.Empty, // Personnel don't need password
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<UserDto>(user);
    }
}

