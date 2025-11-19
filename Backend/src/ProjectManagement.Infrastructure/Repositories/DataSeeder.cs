using Microsoft.EntityFrameworkCore;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Enums;
using ProjectManagement.Infrastructure.Persistence;
using System.Security.Cryptography;
using System.Text;

namespace ProjectManagement.Infrastructure.Repositories;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (await context.Users.AnyAsync())
        {
            return; // Database has been seeded
        }

        // Create Admin User
        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Admin User",
            Email = "admin@projectmanagement.com",
            Role = UserRole.Admin,
            PasswordHash = HashPassword("Admin123!"),
            CreatedAt = DateTime.UtcNow
        };

        // Create Member Users
        var member1 = new User
        {
            Id = Guid.NewGuid(),
            FullName = "John Doe",
            Email = "john@projectmanagement.com",
            Role = UserRole.Member,
            PasswordHash = HashPassword("Member123!"),
            CreatedAt = DateTime.UtcNow
        };

        var member2 = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Jane Smith",
            Email = "jane@projectmanagement.com",
            Role = UserRole.Member,
            PasswordHash = HashPassword("Member123!"),
            CreatedAt = DateTime.UtcNow
        };

        context.Users.AddRange(adminUser, member1, member2);

        // Create Teams
        var team1 = new Team
        {
            Id = Guid.NewGuid(),
            Name = "Development Team",
            Description = "Main development team",
            CreatedAt = DateTime.UtcNow
        };

        var team2 = new Team
        {
            Id = Guid.NewGuid(),
            Name = "QA Team",
            Description = "Quality Assurance team",
            CreatedAt = DateTime.UtcNow
        };

        context.Teams.AddRange(team1, team2);

        // Create UserTeam relationships
        var userTeam1 = new UserTeam
        {
            UserId = member1.Id,
            TeamId = team1.Id,
            User = member1,
            Team = team1
        };

        var userTeam2 = new UserTeam
        {
            UserId = member2.Id,
            TeamId = team1.Id,
            User = member2,
            Team = team1
        };

        var userTeam3 = new UserTeam
        {
            UserId = member2.Id,
            TeamId = team2.Id,
            User = member2,
            Team = team2
        };

        context.UserTeams.AddRange(userTeam1, userTeam2, userTeam3);

        // Create Projects
        var project1 = new Project
        {
            Id = Guid.NewGuid(),
            Name = "E-Commerce Platform",
            Description = "Building a new e-commerce platform",
            Status = ProjectStatus.InProgress,
            StartDate = DateTime.UtcNow.AddDays(-30),
            EndDate = DateTime.UtcNow.AddDays(60),
            TeamId = team1.Id,
            Team = team1
        };

        var project2 = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Mobile App",
            Description = "iOS and Android mobile application",
            Status = ProjectStatus.NotStarted,
            StartDate = DateTime.UtcNow.AddDays(10),
            EndDate = DateTime.UtcNow.AddDays(100),
            TeamId = team1.Id,
            Team = team1
        };

        context.Projects.AddRange(project1, project2);

        // Create Tasks
        var task1 = new ProjectTask
        {
            Id = Guid.NewGuid(),
            ProjectId = project1.Id,
            Title = "Setup Database",
            Description = "Configure database schema",
            Status = ProjectManagement.Domain.Enums.TaskStatus.Done,
            AssignedTo = member1.Id,
            DueDate = DateTime.UtcNow.AddDays(-20),
            Project = project1
        };

        var task2 = new ProjectTask
        {
            Id = Guid.NewGuid(),
            ProjectId = project1.Id,
            Title = "Implement Authentication",
            Description = "JWT authentication system",
            Status = ProjectManagement.Domain.Enums.TaskStatus.Doing,
            AssignedTo = member1.Id,
            DueDate = DateTime.UtcNow.AddDays(10),
            Project = project1
        };

        var task3 = new ProjectTask
        {
            Id = Guid.NewGuid(),
            ProjectId = project1.Id,
            Title = "Create API Endpoints",
            Description = "RESTful API endpoints",
            Status = ProjectManagement.Domain.Enums.TaskStatus.Todo,
            AssignedTo = member2.Id,
            DueDate = DateTime.UtcNow.AddDays(20),
            Project = project1
        };

        context.Tasks.AddRange(task1, task2, task3);

        await context.SaveChangesAsync();
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }
}

