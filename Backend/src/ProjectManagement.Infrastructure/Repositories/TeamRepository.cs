using Microsoft.EntityFrameworkCore;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Infrastructure.Persistence;

namespace ProjectManagement.Infrastructure.Repositories;

public class TeamRepository : Repository<Team>
{
    public TeamRepository(ApplicationDbContext context) : base(context)
    {
    }

    public override async Task<IEnumerable<Team>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(t => t.UserTeams)
                .ThenInclude(ut => ut.User)
            .ToListAsync(cancellationToken);
    }

    public override async Task<Team?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(t => t.UserTeams)
                .ThenInclude(ut => ut.User)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }
}

