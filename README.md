# Task Management App

A full-stack task management application with project-based collaboration, real-time updates via WebSockets, and role-based access control.

**Live URL:** https://task-app.ahmedrashad.online/  
**Swagger API Docs:** https://task-app.ahmedrashad.online/swagger

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running Locally](#running-locally)
- [Running with Docker](#running-with-docker)
- [Test Credentials](#test-credentials)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)

---

## Architecture Overview

```
┌─────────────┐       ┌──────────────┐       ┌──────────┐
│   Frontend   │ ────→ │   Backend    │ ────→ │PostgreSQL│
│   (React)    │  API  │  (NestJS)    │  ORM  │          │
│   Port 80    │ ←──── │  Port 3000   │ ←──── │ Port 5432│
└─────────────┘  WS   └──────────────┘       └──────────┘
                        ↕ WebSocket
                     (Socket.IO)
```

The application follows a **monorepo-style** structure with separate `frontend/` and `backend/` directories:

- **Frontend** — React 19 SPA with Vite, TanStack Query, and Zustand. Communicates with the backend via REST API and WebSocket (Socket.IO).
- **Backend** — NestJS 11 API with Prisma ORM. Handles authentication, project/task CRUD, member management, and real-time updates.
- **Database** — PostgreSQL 16 with Prisma migrations.
- **WebSocket** — Socket.IO gateway for real-time task status updates. Clients subscribe to project-specific channels.

### Data Flow

1. User authenticates via JWT (access + refresh tokens).
2. API requests are guarded by JWT auth, project membership, and role-based guards (owner/creator/assignee).
3. Task status changes are broadcast via WebSocket to all connected clients in the project channel.
4. The frontend cache is invalidated or optimistically updated on socket events.

---

## Tech Stack

### Backend
| Technology | Version |
|------------|---------|
| Node.js | 22 |
| NestJS | 11 |
| Prisma | 7 (PostgreSQL adapter) |
| Passport + JWT | Auth |
| Socket.IO | Real-time |
| Mailjet | Email service |
| Swagger | API docs |
| Jest | Testing |

### Frontend
| Technology | Version |
|------------|---------|
| React | 19 |
| Vite | 8 |
| TanStack React Query | 5 |
| Zustand | 5 |
| react-hook-form + zod | Forms |
| Tailwind CSS | 4 |
| shadcn/ui + Base UI | Components |
| Socket.IO Client | Real-time |

---

## Project Structure

```
task-management-app/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Prisma migrations
│   ├── src/
│   │   ├── auth/                  # Authentication (register, login, refresh, password reset)
│   │   ├── common/                # Shared: constants, decorators, filters, interceptors, email
│   │   ├── prisma/                # Prisma service + module
│   │   ├── projects/              # Project CRUD + member management
│   │   ├── tasks/                 # Task CRUD + status management + WebSocket gateway
│   │   └── users/                 # User profile
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                   # Axios client, socket helper, query client
│   │   ├── components/ui/         # Shared UI components (button, dialog, input, etc.)
│   │   ├── features/
│   │   │   ├── auth/              # Sign in, sign up, forgot/reset password
│   │   │   └── projects/          # Projects list, project detail, members tab, tasks tab
│   │   ├── layouts/               # Auth layout, Dashboard layout
│   │   ├── routes/                # Route definitions + guards
│   │   └── store/                 # Zustand auth store
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .env                          # Docker Compose environment variables
└── README.md
```

---

## Features

### Authentication
- Register, login, logout with JWT (access + refresh tokens)
- Forgot / reset password via email (Mailjet)
- Persistent sessions with automatic token refresh

### Projects
- Create, view, edit, delete projects
- Paginated project list with member/task counts
- Role display (owner / member)
- Only owner can edit / delete a project

### Members
- View project members with roles
- Owner can add members by email (invitation email sent)
- Owner can remove members
- Owner is always listed and cannot be removed

### Tasks
- Full CRUD with title, description, priority, due date, assignee
- Paginated task list with filters (status, priority, assignee)
- Task status management (TODO → IN_PROGRESS → DONE)
- Status change history with timeline view
- Role-based action permissions:
  - **Owner**: all actions
  - **Creator**: edit, delete, update status
  - **Assignee**: update status
  - **Member**: view, create tasks

### Real-Time
- WebSocket connection on project entry
- Task status changes broadcast to all project members

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?schema=public` |
| `JWT_SECRET` | JWT signing secret | `your-jwt-secret` |
| `JWT_EXPIRATION` | Access token expiry | `15m` |
| `JWT_REFRESH_SECRET` | Refresh token secret | `your-refresh-secret` |
| `JWT_REFRESH_EXPIRATION` | Refresh token expiry | `7d` |
| `FRONTEND_URL` | Frontend URL | `http://localhost:5173` |
| `NODE_ENV` | Environment | `development` / `production` |
| `MAILJET_API_KEY` | Mailjet API key | *(optional, for password reset)* |
| `MAILJET_SECRET_KEY` | Mailjet secret key | *(optional)* |
| `MAILJET_FROM_EMAIL` | Sender email | *(optional)* |
| `MAILJET_FROM_NAME` | Sender name | *(optional)* |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000/api` |

### Docker Compose (`./.env`)

plus PostgreSQL credentials for docker compose.

---

## Database Setup

### PostgreSQL

1. Ensure PostgreSQL is running and create the database:

```bash
createdb task_management_db
```

2. Copy the environment file:

```bash
cp backend/.env.example backend/.env
# Edit DATABASE_URL with your local credentials
```

3. Run Prisma migrations:

```bash
cd backend
npx prisma migrate dev
```


### Backend

```bash
cd backend
npm install
cp .env.example .env        # Edit with your database credentials
npx prisma migrate dev      # Apply migrations
npm run start:dev           # http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env        # Edit VITE_API_URL if needed
npm run dev                 # http://localhost:5173
```

The frontend dev server proxies API calls to the backend at `http://localhost:3000/api`.

---

## Running with Docker

### Using Docker Compose

```bash
# Clone and navigate to the project
git clone <repo-url>
cd task-management-app

# Environment variables are pre-configured in .env for local use
docker compose up -d --build
```

This starts:
- **PostgreSQL** on port 5432
- **Backend** on port 3000
- **Frontend** on port 80

Access the app at `http://localhost`.

### Using Pre-built Docker Images


---

### 🚀 Test Credentials & Quick Guide

To test the application easily without registering new accounts, you can use these ready-made demo accounts:

* **Project Owner Account:**
  * **Email:** `owner@example.com`
  * **Password:** `Aa@123456`
  * *(Already created with a sample project, tasks, and members).*

* **Project Member Account:**
  * **Email:** `bewaya8500@candaba.com`
  * **Password:** `Aa@123456`
  * *(Already added as a member to test task assignments and real-time WebSocket updates).*

#### How to test:
1. Log in with the Owner account to manage projects and tasks.
2. Log in with the Member account in another browser/tab to watch real-time changes and live collaboration in action!
3. **Alternatively:** You can register a brand new account yourself and create your own projects from scratch.
4. **Note:** If you invite a new member, the invitation email might land in the **Spam / Junk** folder, so check there if it doesn't show up in the inbox!

---

## API Documentation

Full Swagger documentation is available at:

- **Live:** https://task-app.ahmedrashad.online/swagger
- **Local:** http://localhost:3000/swagger

### Authentication Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login | No |
| `POST` | `/api/auth/refresh` | Refresh access token | Cookie |
| `POST` | `/api/auth/logout` | Logout | No |
| `POST` | `/api/auth/forgot-password` | Request password reset | No |
| `POST` | `/api/auth/reset-password` | Reset password with token | No |

### User Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/api/users/me` | Get current user profile | JWT |

### Project Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/api/projects` | Create a project | JWT |
| `GET` | `/api/projects` | List projects (paginated) | JWT |
| `GET` | `/api/projects/:id` | Get project details | JWT + Member |
| `PATCH` | `/api/projects/:id` | Update project | JWT + Owner |
| `DELETE` | `/api/projects/:id` | Delete project | JWT + Owner |

### Member Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/api/projects/:id/members` | List members | JWT + Member |
| `POST` | `/api/projects/:id/members` | Add member by email | JWT + Owner |
| `DELETE` | `/api/projects/:id/members/:memberId` | Remove member | JWT + Owner |

### Task Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/api/projects/:projectId/tasks` | Create a task | JWT + Member |
| `GET` | `/api/projects/:projectId/tasks` | List tasks (paginated, filtered) | JWT + Member |
| `GET` | `/api/projects/:projectId/tasks/:taskId` | Get task details with status history | JWT + Member |
| `PATCH` | `/api/projects/:projectId/tasks/:taskId` | Update task | JWT + Owner/Creator |
| `PATCH` | `/api/projects/:projectId/tasks/:taskId/status` | Update task status | JWT + Owner/Creator/Assignee |
| `DELETE` | `/api/projects/:projectId/tasks/:taskId` | Delete task | JWT + Owner/Creator |

### Task Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `status` | `TODO \| IN_PROGRESS \| DONE` | Filter by status |
| `priority` | `LOW \| MEDIUM \| HIGH \| URGENT` | Filter by priority |
| `assigneeId` | UUID | Filter by assignee |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |

### WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `subscribe` | Client → Server | `projectId: string` |
| `unsubscribe` | Client → Server | `projectId: string` |
| `task.status.changed` | Server → Client | `{ taskId, oldStatus, newStatus, changedBy, timestamp }` |

---

## Testing

### Backend Tests

```bash
cd backend
npm test            # Run unit tests
npm run test:watch  # Watch mode
npm run test:cov    # Coverage report
```

Test files:
- `src/auth/auth.service.spec.ts`
- `src/projects/projects.service.spec.ts`
- `src/tasks/tasks.service.spec.ts`

### Test Configuration

Tests use mocked Prisma service and JWT service. No database connection is required.

---

## Deployment

The application is deployed on **AWS EC2** using Docker.

### Live URLs

| Service | URL |
|---------|-----|
| Application | https://task-app.ahmedrashad.online |
| API Docs | https://task-app.ahmedrashad.online/swagger |

### Docker Hub Images

| Component | Image |
|-----------|-------|
| Backend | `ahmed654/task-management-backend:latest` |
| Frontend | `ahmed654/task-management-frontend:latest` |

The frontend nginx configuration proxies `/api` and `/ws` requests to the backend container, so both services are accessible from the same domain.
