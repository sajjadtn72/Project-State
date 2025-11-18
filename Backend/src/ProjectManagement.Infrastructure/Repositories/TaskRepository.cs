using Microsoft.EntityFrameworkCore;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Infrastructure.Persistence;

namespace ProjectManagement.Infrastructure.Repositories;

public class TaskRepository : Repository<ProjectTask>
{
    public TaskRepository(ApplicationDbContext context) : base(context)
    {
    }

    public override async Task<IEnumerable<ProjectTask>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(t => t.Project)
            .Include(t => t.AssignedUser)
            .ToListAsync(cancellationToken);
    }

    public override async Task<ProjectTask?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(t => t.Project)
            .Include(t => t.AssignedUser)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }
}

