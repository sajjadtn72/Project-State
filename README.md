# Project & Team Management System

A complete production-ready Project and Team Management System built with .NET 8 Web API (Clean Architecture) and React + Vite + TypeScript + Ant Design + TailwindCSS.

## 🏗️ Architecture

- **Backend**: .NET 8 Web API (Clean Architecture + EF Core + Repository Pattern + Unit of Work)
- **Frontend**: React 18 + Vite + TypeScript + Ant Design + TailwindCSS
- **Database**: SQL Server (EF Core Code First)
- **Authentication**: JWT-based authentication
- **State Management**: Zustand + React Query

## 📁 Project Structure

```
├── Backend/
│   ├── src/
│   │   ├── ProjectManagement.API/          # Web API layer (Controllers, Middleware, Config)
│   │   ├── ProjectManagement.Application/   # Application layer (DTOs, Services, Validators, Mappings)
│   │   ├── ProjectManagement.Domain/        # Domain layer (Entities, Enums, Interfaces)
│   │   └── ProjectManagement.Infrastructure/# Infrastructure layer (DbContext, Repositories, Migrations)
│   └── ProjectManagement.sln
├── src/                                     # Frontend React app
│   ├── components/                          # React components
│   │   └── layout/                          # Layout components
│   ├── pages/                               # Page components
│   │   ├── auth/                            # Login, Register
│   │   ├── dashboard/                       # Dashboard
│   │   ├── teams/                           # Teams management
│   │   ├── projects/                        # Projects management
│   │   ├── project-details/                 # Project details
│   │   └── tasks/                           # Tasks board
│   ├── services/                            # API services
│   ├── store/                               # Zustand stores
│   ├── types/                               # TypeScript types
│   └── styles/                              # Global styles (Tailwind)
└── README.md
```

## 🗄️ Database Models

- **User**: Id, FullName, Email (unique), PasswordHash, Role (Admin/Member), CreatedAt
- **Team**: Id, Name, Description, CreatedAt
- **UserTeam** (Junction): UserId, TeamId (Many-to-Many relationship)
- **Project**: Id, Name, Description, Status (NotStarted/InProgress/Review/Completed), StartDate, EndDate, TeamId
- **ProjectTask**: Id, ProjectId, Title, Description, Status (Todo/Doing/Done), AssignedTo (UserId), DueDate

## 🚀 Getting Started

### Prerequisites

- .NET 8 SDK
- SQL Server (LocalDB or SQL Server Express)
- Node.js 18+ and npm
- Visual Studio 2022 or VS Code (for backend)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd Backend
```

2. Restore NuGet packages:
```bash
dotnet restore
```

3. Update the connection string in `Backend/src/ProjectManagement.API/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ProjectManagementDb;Trusted_Connection=True;MultipleActiveResultSets=true"
  }
}
```

4. Create and apply database migrations:
```bash
cd src/ProjectManagement.API
dotnet ef migrations add InitialCreate --project ../ProjectManagement.Infrastructure
dotnet ef database update
```

5. Run the API:
```bash
dotnet run --project src/ProjectManagement.API
```

The API will be available at `http://localhost:5000`
Swagger UI: `http://localhost:5000/swagger`

### Frontend Setup

1. Navigate to the root directory and install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔐 Default Credentials

The seed data creates the following users:

**Admin User:**
- Email: `admin@projectmanagement.com`
- Password: `Admin123!`

**Member Users:**
- Email: `john@projectmanagement.com`
- Password: `Member123!`
- Email: `jane@projectmanagement.com`
- Password: `Member123!`

## 📋 Features

### Backend (.NET API)
- ✅ Clean Architecture with clear layer separation
- ✅ Repository Pattern + Unit of Work
- ✅ JWT-based authentication (Register, Login, Profile)
- ✅ Global Exception Handling Middleware
- ✅ Comprehensive Logging
- ✅ FluentValidation for all DTOs
- ✅ AutoMapper for DTO mapping
- ✅ Fully normalized database with Fluent API configuration
- ✅ Interface-driven design
- ✅ Swagger enabled
- ✅ Seed data with sample projects, teams, and tasks

### Frontend (React + Ant Design + TailwindCSS)
- ✅ React Query for data fetching and caching
- ✅ Zustand for state management
- ✅ Login/Register pages with form validation
- ✅ Dashboard with statistics and recent activities
- ✅ Teams page - List, create, edit, delete, manage members
- ✅ Projects page - List with filters, create, edit, delete, status management
- ✅ Project Details page - View project info, tasks, add tasks, assign users
- ✅ Tasks Board - Kanban board (Todo → Doing → Done) with drag-and-drop
- ✅ Protected routes with authentication
- ✅ Role-based access control (Admin/Member)
- ✅ Axios interceptors for JWT handling
- ✅ Error handling with Ant Design notifications
- ✅ TailwindCSS for styling and responsive design

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/{id}` - Get user by ID (Admin only)

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams/{id}` - Get team by ID
- `POST /api/teams` - Create team (Admin only)
- `PUT /api/teams/{id}` - Update team (Admin only)
- `DELETE /api/teams/{id}` - Delete team (Admin only)
- `POST /api/teams/{id}/members` - Add member to team (Admin only)
- `DELETE /api/teams/{id}/members/{userId}` - Remove member from team (Admin only)

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/{id}` - Get project by ID
- `POST /api/projects` - Create project (Admin only)
- `PUT /api/projects/{id}` - Update project (Admin only)
- `DELETE /api/projects/{id}` - Delete project (Admin only)
- `PATCH /api/projects/{id}/status` - Update project status

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/project/{projectId}` - Get tasks by project
- `GET /api/tasks/{id}` - Get task by ID
- `POST /api/tasks` - Create task (Admin only)
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task (Admin only)
- `PATCH /api/tasks/{id}/status` - Update task status
- `PATCH /api/tasks/{id}/assign/{userId}` - Assign task to user

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

## 📝 Notes

- The backend uses SQL Server LocalDB by default. Change the connection string in `appsettings.json` for other databases.
- JWT tokens expire after 7 days.
- Password hashing uses SHA256 (consider using bcrypt or Argon2 for production).
- The frontend uses Vite proxy to forward `/api` requests to the backend.
- TailwindCSS is used for layout and utility styling, while Ant Design provides UI components.

## 🧪 Testing

1. Start the backend API (`dotnet run` in Backend/src/ProjectManagement.API)
2. Start the frontend (`npm run dev`)
3. Navigate to `http://localhost:5173`
4. Register a new account or login with the default admin credentials
5. Explore the features!

## 📦 Technologies Used

**Backend:**
- .NET 8
- Entity Framework Core 8
- JWT Bearer Authentication
- FluentValidation
- AutoMapper
- Swagger/OpenAPI

**Frontend:**
- React 18
- TypeScript
- Vite
- Ant Design 5
- TailwindCSS 3
- React Router 6
- React Query (@tanstack/react-query)
- Zustand
- Axios
- Day.js

## 🔒 Security Notes

- In production, use stronger password hashing (bcrypt, Argon2)
- Store JWT secret key securely (environment variables, Azure Key Vault, etc.)
- Enable HTTPS in production
- Implement rate limiting
- Add input sanitization
- Use CORS properly for production domains

## 📄 License

This project is provided as-is for educational and development purposes.
