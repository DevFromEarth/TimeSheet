# TimeSheet

A comprehensive timesheet management system built with a modern layered architecture, featuring role-based approval workflows and advanced reporting capabilities. The application consists of a C# .NET 8 REST API backend and an Angular frontend.

## Table of Contents

- [Architecture](#architecture)
- [Design Patterns](#design-patterns)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Trade-offs & Justifications](#trade-offs--justifications)

---

## Architecture

### Layered Architecture Overview

The application follows a **Clean Architecture** approach with clear separation of concerns across multiple layers:

```
┌─────────────────────────────────────────┐
│         API Controllers Layer            │
│    (REST endpoints, routing, validation)│
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Services Layer                   │
│  (Business logic, orchestration)        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Repository Layer                    │
│    (Data access, Unit of Work)          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Data Access Layer                │
│   (Entity Framework Core, DbContext)    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│       Database Layer                     │
│    (SQL Server with Migrations)         │
└─────────────────────────────────────────┘
```

### Key Layers

1. **Controllers** (`Controllers/`)
   - Handle HTTP requests/responses
   - Route requests to appropriate services
   - Validate incoming data
   - Controllers: AuthController, ProjectsController, TimesheetsController, ReportsController, etc.

2. **Services** (`Services/`)
   - Contain business logic and orchestration
   - Coordinate between repositories and controllers
   - Examples: TimesheetService, ProjectService, ReportService, ProjectAssignmentService

3. **Repositories** (`Repositories/`)
   - Abstract data access operations
   - Implement Unit of Work pattern
   - Support querying, filtering, and persistence operations

4. **Data Access** (`Data/`)
   - Entity Framework Core DbContext configuration
   - AutoMapper profiles for DTO transformations
   - Database migrations

5. **Models** (`Models/`)
   - Domain entities representing core business objects
   - User, Project, Timesheet, ProjectAssignment

6. **DTOs** (`DTOs/`)
   - Data Transfer Objects for request/response payloads
   - Keep API contracts separate from internal models
   - Enable flexible API versioning

---

## Design Patterns

### 1. **Repository Pattern** with **Unit of Work**

**Implementation:**
- `IRepository<T>` interface provides generic CRUD operations
- Specialized repositories: `ITimesheetRepository`, `IProjectAssignmentRepository`
- `IUnitOfWork` manages multiple repositories and transaction control
- All repositories are injected through `UnitOfWork` class

**Benefits:**
- Decouples business logic from data access layer
- Enables easy testing with mock repositories
- Centralized transaction management
- Reusable repository implementation across entities

**Location:** [Repositories/](TimesheetAPI/Repositories/)

---

### 2. **Strategy Pattern** for Approval Workflows

**Implementation:**
```
IApprovalStrategy interface
  ├── ManagerApprovalStrategy
  └── ApprovalContext (encapsulates strategy execution)
```

**Purpose:**
- Encapsulates approval logic rules
- Allows runtime switching between different approval strategies
- Currently implements manager-based approval with validation:
  - Only managers can approve
  - Managers cannot approve their own timesheets
  - Only "Submitted" status timesheets can be approved

**Benefits:**
- Easy to add new approval strategies (e.g., Director approval, Auto-approval)
- Testable in isolation
- Follows Open/Closed Principle (open for extension, closed for modification)

**Location:** [Patterns/ApprovalStrategy.cs](TimesheetAPI/Patterns/ApprovalStrategy.cs)

---

### 3. **Decorator Pattern** for Validation Chain

**Implementation:**
```
ITimesheetValidator interface
  ├── BaseTimesheetValidator (core validation)
  ├── DuplicateCheckDecorator (wraps base validator)
  └── DailyHoursLimitDecorator (wraps duplicate check)
```

**Purpose:**
- Composable validation chain for timesheet entries
- Each decorator adds specific validation logic without modifying base validator
- Validators are stackable and can be ordered as needed

**Validations Applied:**
1. **Base Validator:** Hours (0.1-24), Description required
2. **Duplicate Check Decorator:** Prevents duplicate entries for same user/project/date
3. **Daily Hours Limit Decorator:** Enforces maximum hours per day (configurable)

**Benefits:**
- Easy to add new validation rules
- Single Responsibility Principle
- Flexible composition at runtime
- Non-invasive extension mechanism

**Location:** [Patterns/TimesheetValidationDecorator.cs](TimesheetAPI/Patterns/TimesheetValidationDecorator.cs)

---

### 4. **Factory Pattern** for Report Generation

**Implementation:**
```
IReportFactory interface
  └── Creates different IReport implementations
    ├── EmployeeHoursReport
    └── ProjectHoursReport
```

**Purpose:**
- Centralizes report object creation logic
- Encapsulates complex report initialization
- Enables consistent report interface regardless of type

**Benefits:**
- Decouples report creation from consumption
- Easy to add new report types
- Consistent report generation workflow
- Supports dynamic report type selection at runtime

**Location:** [Patterns/ReportFactory.cs](TimesheetAPI/Patterns/ReportFactory.cs)

---

### 5. **Data Mapper Pattern** (AutoMapper)

**Implementation:**
- `MappingProfile` class defines all entity-to-DTO mappings
- Automatic property mapping with custom transformations
- Null-safe partial updates for PUT/PATCH operations

**Benefits:**
- Eliminates manual mapping code
- Centralized DTO transformation logic
- Supports complex projections and nested mappings
- Easily maintainable and testable

**Location:** [Data/MappingProfile.cs](TimesheetAPI/Data/MappingProfile.cs)

---

## Technology Stack

### Backend
- **Framework:** ASP.NET Core 8
- **ORM:** Entity Framework Core
- **Database:** SQL Server (Docker container)
- **Mapping:** AutoMapper
- **Authentication:** JWT Bearer tokens
- **API Documentation:** Swagger/OpenAPI

### Frontend
- **Framework:** Angular (latest)
- **Styling:** SCSS
- **Build Tool:** Angular CLI

### Infrastructure
- **Containerization:** Docker (SQL Server)
- **Cross-Origin:** CORS enabled for localhost:4200

---

## Project Structure

```
TimesheetAPI/
├── Controllers/          # HTTP endpoint handlers
├── Services/             # Business logic layer
├── Repositories/         # Data access abstraction
├── Models/               # Domain entities
├── DTOs/                 # Data transfer objects
├── Data/                 # EF Core configuration
├── Migrations/           # Database schema versions
├── Patterns/             # Design pattern implementations
│   ├── ApprovalStrategy.cs
│   ├── ReportFactory.cs
│   └── TimesheetValidationDecorator.cs
└── Properties/           # Application configuration

TimeSheetWeb/
├── src/
│   ├── app/              # Angular components
│   ├── environments/     # Environment configs
│   └── styles.scss       # Global styles
├── angular.json          # Angular CLI config
└── package.json          # Dependencies
```

---

## Trade-offs & Justifications

### 1. **Layered Architecture vs. Microservices**

**Choice:** Layered Architecture (Monolithic)

**Rationale:**
- Simpler operational complexity for a single domain (timesheet management)
- Easier to implement and maintain initially
- Sufficient for current scale and team size
- Lower deployment overhead

**Trade-off:**
- ❌ Limited horizontal scalability
- ❌ Tightly coupled components
- ✅ **Justification:** Domain is cohesive enough; benefits outweigh drawbacks for current requirements

**Future:** Can be refactored to microservices (Authentication, Reporting, Timesheet services) if scalability becomes a priority

---

### 2. **Generic Repository with Specialized Repositories**

**Choice:** Hybrid approach (generic + specialized)

**Implementation:**
- Generic `IRepository<T>` for standard CRUD
- Specialized `ITimesheetRepository` for complex queries
- Both managed through `IUnitOfWork`

**Rationale:**
- Balances reusability with flexibility
- Avoids "leaky abstractions" of pure generic repositories
- Specialized repos handle complex domain logic (duplicate checks, status filters)

**Trade-off:**
- ❌ More interfaces to maintain
- ✅ **Justification:** Flexibility and clarity outweigh complexity

---

### 3. **Strategy Pattern for Approval (vs. Hard-coded Logic)**

**Choice:** Strategy Pattern

**Rationale:**
- Business requirements may evolve (director approval, tiered approval)
- Testable in isolation
- Adheres to SOLID principles

**Trade-off:**
- ❌ More code upfront for single strategy
- ✅ **Justification:** Extensibility and maintainability are worth the initial overhead

---

### 4. **Decorator Pattern for Validation (vs. Single Validator Class)**

**Choice:** Decorator Pattern

**Rationale:**
- Each validation rule is independent and testable
- Easy to enable/disable validations
- Composable: can chain validators as needed
- Follows Single Responsibility Principle

**Trade-off:**
- ❌ Slightly more complex than monolithic validator
- ✅ **Justification:** Flexibility and maintainability justify complexity; testability is improved

---

### 5. **DTOs vs. Direct Entity Serialization**

**Choice:** DTOs with AutoMapper

**Rationale:**
- API contract independent from database schema
- Security: prevents accidental exposure of sensitive fields
- Enables different API responses than internal models
- Supports API versioning without changing entities

**Trade-off:**
- ❌ Additional mapping layer adds small performance overhead
- ✅ **Justification:** API stability and security are worth minimal performance cost

**Example:** `Timesheet` entity has `UserId`, but `TimesheetDto` has `UserName` for better readability

---

### 6. **Entity Framework Core with SQL Server**

**Choice:** EF Core with SQL Server

**Rationale:**
- Industry-standard ORM for .NET
- Type-safe queries with LINQ
- Built-in change tracking
- Easy migrations for schema evolution

**Trade-off:**
- ❌ Runtime query compilation overhead
- ❌ Potential N+1 query problems if not careful
- ✅ **Justification:** Developer productivity and maintainability outweigh performance concerns; can optimize with `.Include()` as needed

---

### 7. **Unit of Work Pattern**

**Choice:** Explicit Unit of Work

**Rationale:**
- Centralized transaction management
- Atomic operations across multiple repositories
- Clean transaction handling (BeginTransactionAsync, CommitAsync, RollbackAsync)

**Trade-off:**
- ❌ EF Core DbContext already implements Unit of Work internally
- ✅ **Justification:** Explicit abstraction provides clarity and flexibility

---

### 8. **JWT Authentication**

**Choice:** JWT Bearer Tokens

**Rationale:**
- Stateless authentication (no server-side session storage)
- Scalable across multiple servers
- Industry standard for APIs
- Supports role-based authorization

**Trade-off:**
- ❌ Token revocation requires additional implementation
- ✅ **Justification:** Statelessness justifies implementation of token blacklist if needed

---

## Performance Considerations

1. **Database Queries:** Use `.Include()` to avoid N+1 queries when loading related entities
2. **AutoMapper:** Mapping configuration is compiled once at startup for performance
3. **Caching:** Can be added at service or repository level if needed
4. **Async/Await:** All data access operations are async to prevent thread starvation

---

## Future Enhancements

- [ ] Add caching layer (Redis) for frequently accessed reports
- [ ] Implement approval hierarchy (manager → director)
- [ ] Add audit logging for timesheet changes
- [ ] Support batch operations for bulk timesheet creation
- [ ] Implement pagination for large result sets
- [ ] Add GraphQL support for flexible queries
- [ ] Consider CQRS pattern if read/write loads diverge significantly