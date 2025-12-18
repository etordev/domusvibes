# DomusVibes 🏠✨

DomusVibes is a modern home-sharing and household management platform.  
It allows users to create homes, invite members, and manage shared living spaces in a simple and secure way.

This repository currently contains the **backend** of the application.  
The frontend will be added later.

---

## 📦 Project Structure

```text
domusvibes/
│
├── backend/                 # .NET backend (Clean Architecture)
│   ├── DomusVibes.Api        # ASP.NET Core Web API
│   ├── DomusVibes.Application
│   ├── DomusVibes.Domain
│   └── DomusVibes.Persistence
│
├── assets/
│   └── logo/                # Branding assets
│
├── docs/
│   └── business logic/      # Functional & domain documentation
│
├── docker-compose.yml       # PostgreSQL container
├── DomusVibes.sln           # Solution file
└── README.md


🚀 Backend Tech Stack

.NET 8 / ASP.NET Core

Entity Framework Core

PostgreSQL

Docker

Swagger / OpenAPI

Architecture style:

Clean Architecture

Domain-driven structure (Entities, Aggregates, Repositories)

🧠 Core Concepts

Users
Can register and authenticate.

Homes
A shared space created by a user.

Home Members
Users can join homes via invite codes.

🐳 Running the Project (Backend)
1️⃣ Start PostgreSQL with Docker
docker compose up -d

PostgreSQL will be available on:
localhost:5432

2️⃣ Run database migrations
dotnet ef database update \
  -p backend/DomusVibes.Persistence \
  -s backend/DomusVibes.Api

3️⃣ Start the API
dotnet run --project backend/DomusVibes.Api

The API will start on:
http://localhost:5200

Swagger UI:

http://localhost:5200/swagger

🔌 API Endpoints (examples)
POST /api/users – create a user
POST /api/homes – create a home
POST /api/homes/join – join a home with invite code

🧪 Database
PostgreSQL
Managed via Entity Framework Core migrations
You can inspect the database using tools like DBeaver

🌱 Future Plans
Frontend (React / Next.js or similar)
Authentication & authorization (JWT)
Roles and permissions
Home features (tasks, expenses, notifications)
Deployment (Docker + CI/CD)

📄 License
Private project – all rights reserved.

👤 Author
Developed by etordev
