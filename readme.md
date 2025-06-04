# Mega Drive Organizer

A React + .NET web application for organizing and managing Mega Drive folder links with PIN-based authentication.

## Overview

This app allows users to:
- Store and organize Mega Drive folder links
- Add titles, descriptions, and tags to each link
- Search and filter links by tags
- Secure access with PIN authentication
- Quick access to open links in new tabs

## Architecture

- **Frontend**: React with TypeScript, built with Vite
- **Backend**: .NET 8 Web API
- **Database**: PostgreSQL (production) / SQLite (local development)
- **Deployment**: Docker on VPS

## Local Development Setup

### Prerequisites
- Node.js 18+
- .NET 8 SDK
- Git

### 1. Clone Repository
```bash
git clone https://github.com/AnonSameer/mega-app.git
cd mega-app
```

### 2. Backend Setup
```bash
cd server

# Install dependencies (restore packages)
dotnet restore

# Set up local SQLite database
dotnet ef database update

# Start the API server
dotnet run
# Runs on: http://localhost:5000
```

### 3. Frontend Setup
```bash
cd client

# Install dependencies
yarn install

# Start development server
yarn dev
# Runs on: http://localhost:3000
```

### 4. Access Application
- Open http://localhost:3000
- Default PIN is configured in the backend
- Add your first Mega Drive link!

## Database Migrations

### When You Need to Change the Database Schema

1. **Update your model** (e.g., `server/Models/MegaLink.cs`)

2. **Create migration**:
```bash
cd server
dotnet ef migrations add DescriptiveMigrationName
```

3. **Apply migration locally**:
```bash
dotnet ef database update
```

4. **Commit migration files**:
```bash
git add Migrations/
git commit -m "Add migration for [feature description]"
```

### Example: When We Added PIN Authentication

```bash
# 1. Updated User model to include PIN
# 2. Created migration
cd server
dotnet ef migrations add AddPinToUser

# 3. Applied locally
dotnet ef database update

# 4. Committed changes
git add Migrations/
git commit -m "Add PIN authentication to User model"
```

## Environment Configuration

### Local Development
- **Database**: SQLite (`server/localdb.sqlite`)
- **API URL**: `http://localhost:5000/api`
- **CORS**: Allows all origins

### Production
- **Database**: PostgreSQL on VPS
- **API URL**: `https://yourdomain.com/api`
- **CORS**: Restricted to production domain

## File Structure

```
mega-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API calls
│   │   └── types/          # TypeScript interfaces
│   └── package.json
├── server/                 # .NET backend
│   ├── Controllers/        # API endpoints
│   ├── Models/            # Database models
│   ├── Migrations/        # EF Core migrations
│   └── Program.cs         # App configuration
└── docker-compose.yml     # Production deployment
```

## Common Development Commands

```bash
# Backend
cd server
dotnet run                          # Start API
dotnet ef database update           # Apply migrations
dotnet ef migrations add NewFeature # Create migration

# Frontend  
cd client
yarn dev                           # Start dev server
yarn build                         # Build for production
yarn type-check                   # Check TypeScript

# Full app
docker-compose up --build          # Run with Docker
```

## Deployment

The app auto-deploys to production VPS when you push to the `main` branch via GitHub Actions.

```bash
git push origin main  # Triggers automatic deployment
```