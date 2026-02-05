# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Backend API for "Lemonade" (Лимонад) — a lemonade production management system for multi-branch operations. Handles procurement, production, sales, expenses, and payroll.

**Related:** See `../client/CLAUDE.md` for frontend documentation.

## Commands

```bash
# Build and run (from server directory)
dotnet build OrionLemonade.slnx
dotnet run --project src/API/OrionLemonade.API

# EF Core migrations (from Infrastructure project)
cd src/Infrastructure/OrionLemonade.Infrastructure
dotnet ef migrations add <MigrationName> --startup-project ../../API/OrionLemonade.API
dotnet ef database update --startup-project ../../API/OrionLemonade.API
```

## Tech Stack

- **.NET 10** with ASP.NET Core Web API
- **Entity Framework Core 10** with PostgreSQL (Npgsql)
- **AutoMapper** for DTO mapping
- **OpenAPI** for API documentation

## Architecture

Clean Architecture with 4 layers:

```
OrionLemonade.slnx
├── API/                    # Web API, Controllers, Program.cs
│   └── OrionLemonade.API
├── Application/            # Services, DTOs, Interfaces, Mapping
│   └── OrionLemonade.Application
├── Domain/                 # Entities, Base classes, Domain interfaces
│   └── OrionLemonade.Domain
└── Infrastructure/         # EF DbContext, Repositories, UnitOfWork
    └── OrionLemonade.Infrastructure
```

**Dependency flow:** API → Application → Domain ← Infrastructure

### Key Patterns

- **Repository Pattern**: Generic `IRepository<T>` for data access
- **Unit of Work**: Transaction management via `IUnitOfWork`
- **DI Extensions**: Each layer has `DependencyInjection.cs` for service registration
- **BaseEntity**: All entities inherit from `BaseEntity` (Id, CreatedAt, UpdatedAt)

## Database

PostgreSQL connection configured in `appsettings.json`:
- Default: `Host=localhost;Port=5432;Database=orion_lemonade;Username=postgres;Password=postgres`

## Key Concepts

### Multi-currency
- **USD** — raw material procurement, cost calculations (stored in USD)
- **TJS (somoni)** — sales, expenses, payroll
- Exchange rate is set daily and recorded in each document

### Branches
- All operations are tied to a branch
- Shared catalogs: recipes, ingredients, clients
- Separate per branch: warehouses, production, sales

### Roles
| Role | Access |
|------|--------|
| Director | Everything + all branches |
| Accountant | Finances, payroll, all branches |
| Manager | Sales, clients, assigned branches |
| Storekeeper | Warehouse, production, own branch |
