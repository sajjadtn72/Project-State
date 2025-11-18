using Microsoft.EntityFrameworkCore;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Infrastructure.Persistence;

namespace ProjectManagement.Infrastructure.Repositories;

public class ProjectRepository : Repository<Project>
{
    public ProjectRepository(ApplicationDbContext context) : base(context)
    {
    }

    public override async Task<IEnumerable<Project>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.Team)
            .Include(p => p.Tasks)
            .ToListAsync(cancellationToken);
    }

    public override async Task<Project?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.Team)
            .Include(p => p.Tasks)
                .ThenInclude(t => t.AssignedUser)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }
}

