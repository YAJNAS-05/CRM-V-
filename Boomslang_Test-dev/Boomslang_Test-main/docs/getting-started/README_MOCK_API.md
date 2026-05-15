# Mock API Implementation Guide

## Overview
This document explains the Mock API system that enables all frontend features to work without requiring a fully configured backend database or authentication system.

## Architecture

### Two-Layer API System

```
Frontend ┐
         ├─→ [Try Primary API: http://host:8080/api/v1/...] 
         │   (Backend with real database)
         │   ✓ If SUCCESS → Return data
         │   ✗ If FAIL (401, 403, Network Error) → Fallback
         │
         └─→ [Fallback to Mock API: http://host:8080/api/mock/...]
             (In-memory mock endpoints)
             ✓ Always returns realistic test data
             ✓ No database required
             ✓ No authentication required
```

### Components

#### 1. **MockApiController** (`backend/src/main/java/com/everx/api/MockApiController.java`)
- Provides mock endpoints at `/api/mock/**`
- Returns realistic test data for all modules:
  - Authentication (login, token refresh)
  - CRM (contacts, accounts, deals)
  - Finance (invoices, payments, reports)
  - Field Work (jobs, operations)
  - Reporting (dashboard, sales, AR aging)

#### 2. **Enhanced Axios Configuration** (`frontend/src/api/axiosInstance.ts`)
- Implements automatic fallback logic
- Catches failed requests (401, 403, network errors)
- Automatically redirects to `/mock/` endpoints
- Transparent to API consumers

## Quick Start

### Method 1: Without Backend (Recommended for Development)

```bash
# 1. Start only the frontend
cd frontend
npm install
npm run dev

# 2. Navigate to http://localhost:5173
# 3. Use any login credentials (will hit mock API automatically)
```

**What happens:**
- Frontend tries to call backend API
- Backend is down or returns 401/403
- Axios fallback kicks in
- Mock API returns test data
- App works fully with mock data

### Method 2: With Running Backend (For Integration Testing)

```bash
# 1. Terminal 1: Start backend
cd backend
mvn spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=dev

# 2. Terminal 2: Start frontend
cd frontend
npm run dev

# 3. App uses real API data when available, falls back to mock when needed
```

## Mock API Endpoints

### Authentication
```
POST /api/mock/auth/login
  Input: { email, password }
  Output: { accessToken, refreshToken, user }
  
POST /api/mock/auth/refresh
  Input: { refreshToken }
  Output: { accessToken, refreshToken }
```

### CRM Module
```
GET  /api/mock/contacts?page=0&size=20
POST /api/mock/contacts
  
GET  /api/mock/accounts?page=0&size=20
POST /api/mock/accounts

GET  /api/mock/deals?page=0&size=20
POST /api/mock/deals
```

### Finance Module
```
GET  /api/mock/invoices?page=0&size=20
POST /api/mock/invoices

GET  /api/mock/payments?page=0&size=20

GET  /api/mock/reports/ar-aging
GET  /api/mock/reports/sales
GET  /api/mock/reports/dashboard
```

### Field Work Module
```
GET  /api/mock/field-jobs?page=0&size=20
POST /api/mock/field-jobs
```

### Utilities
```
GET /api/mock/health
  Output: { status: "UP", service: "Mock API" }
```

## Test Data Specifications

### Generated Data Patterns
- Contacts: 100 total items (contact@company.com format)
- Accounts: 150 total items (company names + industry)
- Deals: 200 total items (various stages: PROSPECTING → CLOSED)
- Invoices: 300 total items (various statuses)
- Payments: 150 total items (bank transfer or credit card)
- Field Jobs: 100 total items (various job types)

### All Responses
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "content": [...],           // Paginated items
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 100,
    "totalPages": 5
  },
  "timestamp": "2026-04-20T10:30:00"
}
```

## Configuration

### Enable/Disable Mock Fallback
Edit `frontend/src/api/axiosInstance.ts`:

```typescript
// Enable mock API fallback for development
const ENABLE_MOCK_FALLBACK = true  // Set to false to disable

// Modify timeout if needed
timeout: 10000  // 10 seconds default
```

### Switch Between Real and Mock
```typescript
// Force use of real API only (no fallback)
const ENABLE_MOCK_FALLBACK = false

// Force use of mock API only (for testing)
// Set API_URL to mock endpoint:
const API_URL = `http://${window.location.hostname}:8080/api/mock`
```

## Common Workflows

### 1. Development (No Backend)
```
Login Page
  ↓ (try primary API - fails)
  ↓ (fallback to mock)
✓ Redirect to Dashboard with mock data
  ↓
All pages work with mock data
```

### 2. Testing (With Backend)
```
Start Backend (Java/Spring) 
  ↓
Start Frontend (React/Vite)
  ↓
Real API works for all authenticated requests
  ↓
If backend goes down, automatic fallback to mock
```

### 3. Debugging
Check browser console for messages like:
```
[Mock API Fallback] GET /mock/contacts?page=0&size=20
[Mock API Fallback] POST /mock/deals
```

## Adding New Mock Endpoints

### Step 1: Add endpoint in MockApiController
```java
@GetMapping("/my-module")
public ResponseEntity<?> mockGetMyModule() {
    List<Map<String, Object>> data = /* generate test data */;
    return ResponseEntity.ok(ApiResponse.ok(data, "Module data retrieved"));
}
```

### Step 2: Update fronted API file to use same endpoint name
```typescript
export const myModuleApi = {
  getAll: () =>
    axiosInstance.get<ApiResponse<any>>(`/v1/my-module`),
}
```

### Step 3: Test
- Frontend calls `/v1/my-module`
- Backend fails or returns error
- Fallback converts to `/mock/my-module`
- Mock endpoint returns test data

## Troubleshooting

### Problem: "Cannot connect to server"
**Solution:** Mock API is working - check browser console for fallback messages

### Problem: Mock data not being used
**Solution:** 
1. Set `ENABLE_MOCK_FALLBACK = true` in axiosInstance.ts
2. Check that API URL is correctly set
3. Verify backend is not responding to `/api/mock/` requests

### Problem: Stale data across reloads
**Solution:** Mock data is generated per request, so reload always gives fresh data. This is expected for development.

### Problem: Need different test data
**Solution:** Modify MockApiController.java to return different values:
```java
// Change list size
for (int i = 1; i <= 50; i++)  // Instead of 20

// Change data patterns
response.put("status", "CUSTOM_STATUS")
```

## Production Deployment

### Remove Mock API
To deploy to production, remove MockApiController.java - it's only for development:

```bash
# Remove mock endpoint
rm backend/src/main/java/com/everx/api/MockApiController.java

# Disable fallback in production build
VITE_ENABLE_PRODUCTION=true npm run build
```

### Keep Mock for Staging
Keep MockApiController enabled in staging environment for testing without database:

```bash
# Build with mock API included
mvn clean package
java -jar target/app.jar --spring.profiles.active=staging
```

## Benefits

✅ **Develop Without Backend** - Frontend works completely independently  
✅ **No Database Setup** - No PostgreSQL/MySQL installation needed  
✅ **Automatic Fallback** - Seamless switching when backend unavailable  
✅ **Realistic Data** - Mock data matches expected API responses  
✅ **Fast Development** - No rebuild cycles waiting for database  
✅ **Easy Testing** - Always have predictable test data  
✅ **Transparent** - Works with existing code, no special handling needed  

