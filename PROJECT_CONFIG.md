# EverX Platform Configuration

This document contains the strict, accurate local configurations required to run and build the EverX CRM/ERP platform.

## 1. System Requirements
- **Java**: JDK 21
- **Node.js**: v18+ 
- **Database**: PostgreSQL 15+
- **Build Tools**: Maven 3.8+, npm

---

## 2. Backend Environment (Spring Boot)
Located in `/backend`

### Framework Specs:
- **Framework**: Spring Boot 3.3.0
- **Language**: Java 21
- **Packaging**: .jar
- **Default Port**: `8080`

### Database Configuration (`application.yml`):
- **JDBC URL**: `jdbc:postgresql://localhost:5432/everx_db`
- **Username**: `postgres`
- **Password**: `postgres`
- **Dialect**: `org.hibernate.dialect.PostgreSQLDialect`
- **DDL-Auto**: `update`

### Boot Commands
- **Start Backend API**: `mvn spring-boot:run`
- **Compile/Build**: `mvn clean install -DskipTests`

---

## 3. Frontend Environment (React + Vite)
Located in `/frontend`

### Framework Specs:
- **Framework**: React 18 + Vite (v5.4.21)
- **Language**: TypeScript (`tsc`)
- **Default Port**: `5173`
- **Proxy/Routing Config**: API proxies direct `http://localhost:5173/api/v1/*` \-\> `http://localhost:8080/api/v1/*`

### Boot Commands
- **Start Dev Server**: `npm run dev`
- **Compile/Build (Production)**: `npm run build` (runs `tsc && vite build`)
- **Install Dependencies**: `npm install`

---

## 4. Default Seed/Mock Credentials
When the backend runs for the very first time on a fresh PostgreSQL instance, it seeds an Admin account and mock operations data.

- **Login URL**: `http://localhost:5173/login`
- **Admin Email**: `admin@everx.com`
- **Admin Password**: `password123` (local H2 dev; see `DevAdminCredentials`)
- **Role Permissions Provided**: `SUPER_ADMIN` (Highest priority hierarchy)

---

## 5. Network Definitions
| Service      | Local URL                  | Default Port |
|--------------|----------------------------|--------------|
| Spring App   | `http://localhost:8080`    | 8080         |
| Vite UI      | `http://localhost:5173`    | 5173         |
| PostgreSQL   | `localhost:5432`           | 5432         |

*(Note: There are no `.env` files required for default local development as fallbacks are thoroughly configured in `application.yml` and `vite.config.ts`.)*
