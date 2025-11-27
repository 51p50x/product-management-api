# Product Management API

A NestJS-based REST API for managing products synced from Contentful with automated hourly synchronization, JWT authentication, and comprehensive reporting.

[![Node.js](https://img.shields.io/badge/Node.js-20_LTS-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-red.svg)](https://nestjs.com/)
[![Test Coverage](https://img.shields.io/badge/coverage-47.32%25-brightgreen.svg)](https://github.com/nestjs/nest)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](https://www.docker.com/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start with Docker](#-quick-start-with-docker)
- [Local Development](#-local-development)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Database Schema](#-database-schema)
- [Environment Variables](#-environment-variables)
- [GitHub Actions CI/CD](#-github-actions-cicd)
- [Git Workflow](#-git-workflow)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### Core Functionality
- ✅ **Automated Contentful Sync** - Hourly cron job fetches up to 10,000 products
- ✅ **Insert-Only Strategy** - New products only, no updates to existing records
- ✅ **Soft Delete** - Deleted products won't reappear after sync
- ✅ **Pagination** - Max 5 items per page with filtering support
- ✅ **JWT Authentication** - Secure private endpoints
- ✅ **Comprehensive Reports** - Deleted products, price analysis, category distribution

### Technical Features
- ✅ **TypeScript** - Full type safety
- ✅ **Docker & Docker Compose** - Production-ready containerization
- ✅ **PostgreSQL** - Persistent data storage with automatic table creation
- ✅ **Swagger/OpenAPI** - Interactive API documentation
- ✅ **GitHub Actions** - Automated testing and linting
- ✅ **47.32% Test Coverage** - Exceeds 30% requirement

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | NestJS 11 |
| **Runtime** | Node.js 20 LTS |
| **Language** | TypeScript 5.7 |
| **Database** | PostgreSQL 16 |
| **ORM** | TypeORM 0.3 |
| **Authentication** | JWT (Passport) |
| **Validation** | class-validator, class-transformer |
| **Documentation** | Swagger/OpenAPI |
| **Scheduling** | @nestjs/schedule |
| **Testing** | Jest |
| **Containerization** | Docker, Docker Compose |
| **CI/CD** | GitHub Actions |

---

## 🚀 Quick Start with Docker

### Prerequisites

- Docker (v20.10+)
- Docker Compose (v2.0+)
- Contentful Space ID and Access Token

### 1. Clone and Configure

```bash
# Clone the repository
git clone https://github.com/51p50x/product-management-api.git
cd product-management-api

# Copy environment file
cp .env.example .env

# Edit .env and add your Contentful credentials
# Required: CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN
```

### 2. Start with Docker Compose

```bash
# Start all services (API + PostgreSQL)
docker-compose up -d

# View logs
docker-compose logs -f api

# Check status
docker-compose ps
```

### 3. Access the Application

- **API:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/api/docs
- **Database:** localhost:5432

### 4. Stop Services

```bash
# Stop services
docker-compose down

# Stop and remove database data
docker-compose down -v
```

---

## 💻 Local Development

### Prerequisites

- Node.js 20 LTS
- PostgreSQL 16 (or use Docker for database only)
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials

# Start PostgreSQL with Docker (optional)
docker-compose up postgres -d

# Run database migrations (automatic with TypeORM synchronize)
# Tables will be created automatically on first run

# Start development server
npm run start:dev

# API will be available at http://localhost:3000
```

### Development Commands

```bash
# Start in watch mode
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Run tests
npm test

# Run tests with coverage
npm run test:cov

# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix

# Format code
npm run format
```

---

## 📚 API Documentation

### Interactive Documentation

Visit **http://localhost:3000/api/docs** for full Swagger/OpenAPI documentation.

### Public Endpoints (No Authentication)

#### Products

**GET /api/products** - List products (paginated)

Query Parameters:
- `page` (number, default: 1) - Page number
- `limit` (number, max: 5, default: 5) - Items per page
- `name` (string) - Filter by name (partial match)
- `category` (string) - Filter by category
- `brand` (string) - Filter by brand
- `color` (string) - Filter by color
- `minPrice` (number) - Minimum price
- `maxPrice` (number) - Maximum price

Example:
```bash
curl "http://localhost:3000/api/products?page=1&limit=5&category=Electronics&minPrice=50&maxPrice=500"
```

**GET /api/products/:id** - Get single product

Example:
```bash
curl http://localhost:3000/api/products/123e4567-e89b-12d3-a456-426614174000
```

**DELETE /api/products/:id** - Soft delete product

Example:
```bash
curl -X DELETE http://localhost:3000/api/products/123e4567-e89b-12d3-a456-426614174000
```

#### Authentication

**POST /api/auth/generate-token** - Generate JWT token

Request Body:
```json
{
  "username": "admin"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": "24h"
}
```

Example:
```bash
curl -X POST http://localhost:3000/api/auth/generate-token \
  -H "Content-Type: application/json" \
  -d '{"username":"admin"}'
```

### Private Endpoints (JWT Required)

Add the JWT token to your requests:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Reports

**GET /api/reports/deleted-products** - Percentage of deleted products

Response:
```json
{
  "totalProducts": 10000,
  "deletedProducts": 150,
  "deletedPercentage": 1.5
}
```

Example:
```bash
curl http://localhost:3000/api/reports/deleted-products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**GET /api/reports/non-deleted-products** - Products with/without price

Query Parameters:
- `startDate` (ISO date, optional) - Filter from date
- `endDate` (ISO date, optional) - Filter to date

Response:
```json
{
  "totalNonDeleted": 9850,
  "withPrice": 8500,
  "withoutPrice": 1350,
  "withPricePercentage": 86.29,
  "withoutPricePercentage": 13.71,
  "dateRange": {
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-12-31T00:00:00.000Z"
  }
}
```

Example:
```bash
curl "http://localhost:3000/api/reports/non-deleted-products?startDate=2025-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**GET /api/reports/products-by-category** - Distribution by category

Response:
```json
{
  "totalProducts": 9850,
  "distribution": [
    {
      "category": "Electronics",
      "count": 3500,
      "percentage": 35.53
    },
    {
      "category": "Clothing",
      "count": 2800,
      "percentage": 28.43
    }
  ]
}
```

Example:
```bash
curl http://localhost:3000/api/reports/products-by-category \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- products.service.spec.ts
```

### Test Coverage

Current coverage: **47.32%** (exceeds 30% requirement)

| Module | Coverage |
|--------|----------|
| ProductsService | 94.59% |
| ProductsController | 96.36% |
| ReportsService | 87.34% |
| AuthController | 100% |
| ContentfulService | 100% |

### Test Suites

- ✅ **ProductsService** - CRUD operations, pagination, filtering
- ✅ **ReportsService** - All report calculations
- ✅ **ProductsController** - API endpoints
- ✅ **AuthController** - Token generation
- ✅ **ContentfulService** - Configuration validation

---

## 🗄️ Database Schema

### Products Table

The database table is automatically created when you start the application using the `init.sql` script.

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "contentfulId" VARCHAR NOT NULL UNIQUE,
    name VARCHAR NOT NULL,
    sku INTEGER,
    brand VARCHAR,
    model VARCHAR,
    category VARCHAR,
    color VARCHAR,
    price DECIMAL(10, 2),
    currency VARCHAR,
    stock INTEGER,
    description TEXT,
    "deletedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Indexes

Optimized for performance:

```sql
-- Fast lookups during sync
CREATE INDEX idx_products_contentful_id ON products("contentfulId");

-- Soft delete queries
CREATE INDEX idx_products_deleted_at ON products("deletedAt");

-- Filtered queries
CREATE INDEX idx_products_category ON products(category) WHERE category IS NOT NULL;
CREATE INDEX idx_products_brand ON products(brand) WHERE brand IS NOT NULL;
```

### Database Initialization

The `init.sql` file is automatically executed when PostgreSQL container starts for the first time:

- Creates `products` table if it doesn't exist
- Creates all necessary indexes
- Uses `IF NOT EXISTS` to be idempotent

---

## 🌍 Environment Variables

### Required Variables

```env
# Contentful (Required)
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_access_token

# Database (Required for production)
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=product_management
```

### Optional Variables

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Contentful
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_TYPE=product

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

### Configuration File

All environment variables are validated in `src/config/configuration.ts`:

- ✅ Type-safe configuration
- ✅ Default values for optional settings
- ✅ Runtime validation for required credentials

---

## 🔄 Cron Job

### Automatic Synchronization

The API automatically syncs products from Contentful **every hour**.

**How it works:**
1. Fetches products from Contentful (up to 10,000 limit)
2. Orders by most recently updated first
3. Inserts only NEW products (checks by `contentfulId`)
4. Uses batch inserts (500 records per batch)
5. Skips existing products (no updates)
6. Logs progress and errors

**Configuration:**
- Schedule: `@Cron(CronExpression.EVERY_HOUR)`
- Location: `src/sync/products-sync.service.ts`
- Overlap protection: Built-in flag prevents concurrent runs

**Monitoring:**
```bash
# View sync logs
docker-compose logs -f api | grep "sync"

# Or in development
npm run start:dev
# Watch console for sync messages
```

---

## 🔐 GitHub Actions CI/CD

### Automated Workflow

Every push or pull request to `main` or `develop` triggers:

1. ✅ **Lint Check** - ESLint validation
2. ✅ **Tests** - Full test suite with coverage
3. ✅ **Coverage Check** - Validates >= 30% coverage
4. ✅ **Docker Build** - Validates Dockerfile

### Setup

**No configuration needed!** Just push to GitHub:

```bash
# Initialize git
git init

# Add files
git add .

# Commit with conventional commit
git commit -m "feat: initial project setup"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/product-management-api.git

# Push to main
git push -u origin main

# GitHub Actions will automatically run
# View at: https://github.com/YOUR_USERNAME/product-management-api/actions
```

### Workflow File

Location: `.github/workflows/ci.yml`

**Features:**
- Node.js 20 LTS matrix
- npm cache for faster builds
- Coverage validation
- Docker build cache
- Optional Codecov integration

---

## 🌿 Git Workflow

### Branch Strategy (GitFlow)

```
main (production)
  └── develop (development)
       ├── feature/add-new-endpoint
       ├── feature/improve-reports
       └── bugfix/fix-pagination
```

### Conventional Commits

Use semantic commit messages:

| Prefix | Description | Example |
|--------|-------------|---------|
| `feat:` | New feature | `feat: add products by category report` |
| `fix:` | Bug fix | `fix: resolve pagination issue` |
| `docs:` | Documentation | `docs: update API documentation` |
| `style:` | Code style | `style: format with prettier` |
| `refactor:` | Code refactoring | `refactor: optimize database queries` |
| `test:` | Tests | `test: add unit tests for ReportsService` |
| `chore:` | Maintenance | `chore: update dependencies` |

### Workflow Example

```bash
# Create develop branch
git checkout -b develop

# Create feature branch
git checkout -b feature/new-report

# Make changes
git add .
git commit -m "feat: add stock level report"

# Push feature branch
git push origin feature/new-report

# Create Pull Request on GitHub
# - From: feature/new-report
# - To: develop

# After approval, merge to develop
# Then create PR from develop to main
```

---

## 🐳 Docker

### Docker Compose Services

#### PostgreSQL Database
- **Image:** postgres:16-alpine
- **Port:** 5432
- **Volume:** Persistent data storage
- **Health Check:** Automatic readiness check
- **Init Script:** Automatic table creation via `init.sql`

#### NestJS API
- **Build:** Multi-stage Dockerfile
- **Port:** 3000
- **Depends On:** PostgreSQL (waits for health check)
- **Restart:** Automatic restart on failure

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f postgres

# Restart services
docker-compose restart

# Rebuild after code changes
docker-compose up --build

# Stop services
docker-compose down

# Remove everything including volumes
docker-compose down -v

# Run only database
docker-compose up postgres -d
```

### Dockerfile

**Multi-stage build for optimization:**

1. **Builder Stage**
   - Installs all dependencies
   - Builds TypeScript to JavaScript
   - ~500MB

2. **Production Stage**
   - Installs only production dependencies
   - Copies built files
   - Final image ~150MB

---

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Windows - Find process using port 3000
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F

# Or change port in .env
PORT=3001
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps

# View database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Connect to database manually
docker-compose exec postgres psql -U postgres -d product_management
```

### API Not Starting

```bash
# View API logs
docker-compose logs api

# Check for errors
docker-compose logs api | grep -i error

# Rebuild image
docker-compose up --build api
```

### Tests Failing

```bash
# Run tests locally
npm test

# Check coverage
npm run test:cov

# Fix linting issues
npm run lint -- --fix

# Clear Jest cache
npm test -- --clearCache
```

### Contentful Sync Issues

```bash
# Check environment variables
docker-compose exec api env | grep CONTENTFUL

# View sync logs
docker-compose logs api | grep "sync"

# Manually trigger sync (in development)
# The cron runs every hour automatically
```

### Clear All Data

```bash
# Stop and remove everything
docker-compose down -v

# Remove Docker images
docker rmi product-management-api

# Start fresh
docker-compose up --build -d
```

---

## 📊 Project Structure

```
product-management-api/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI/CD
├── src/
│   ├── auth/                      # JWT authentication
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   └── jwt-auth.guard.ts
│   ├── config/
│   │   └── configuration.ts       # Environment config
│   ├── contentful/
│   │   ├── contentful.service.ts  # Contentful API client
│   │   └── contentful.module.ts
│   ├── products/
│   │   ├── dto/                   # Data Transfer Objects
│   │   ├── entities/
│   │   │   └── product.entity.ts  # TypeORM entity
│   │   ├── products.controller.ts # REST endpoints
│   │   ├── products.service.ts    # Business logic
│   │   └── products.module.ts
│   ├── reports/
│   │   ├── dto/
│   │   ├── reports.controller.ts  # Private endpoints
│   │   ├── reports.service.ts     # Report calculations
│   │   └── reports.module.ts
│   ├── sync/
│   │   ├── products-sync.service.ts # Cron job
│   │   └── sync.module.ts
│   ├── app.module.ts              # Root module
│   └── main.ts                    # Application entry
├── test/                          # E2E tests
├── .dockerignore                  # Docker ignore file
├── .env.example                   # Environment template
├── docker-compose.yml             # Docker orchestration
├── Dockerfile                     # Multi-stage build
├── init.sql                       # Database initialization
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
└── README.md                      # This file
```

---

## 📝 Requirements Checklist

✅ **Node.js version active LTS** - Using Node.js 20 LTS  
✅ **TypeScript** - Entire codebase in TypeScript 5.7  
✅ **30% test coverage** - Currently at 47.32%  
✅ **Dockerized** - Multi-stage Dockerfile  
✅ **docker-compose** - API + PostgreSQL with automatic table creation  
✅ **GitHub Actions** - Tests and linters run automatically  
✅ **Conventional commits** - Ready to use  
✅ **GitFlow** - Branch strategy documented  

---

## 📄 License

UNLICENSED

---

## 🤝 Support

For issues and questions:
- Review logs: `docker-compose logs -f`
- Open an issue on GitHub

---

## 🎯 Quick Reference

```bash
# Start everything
docker-compose up -d

# View API docs
open http://localhost:3000/api/docs

# Generate JWT token
curl -X POST http://localhost:3000/api/auth/generate-token \
  -H "Content-Type: application/json" \
  -d '{"username":"admin"}'

# Get products
curl http://localhost:3000/api/products?page=1&limit=5

# Run tests
npm test -- --coverage

# View logs
docker-compose logs -f api
```

---

**Built with ❤️ using NestJS**
