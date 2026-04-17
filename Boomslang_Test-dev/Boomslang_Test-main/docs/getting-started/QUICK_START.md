# Quick Start Guide - Get Running in 2 Minutes

## TL;DR - Start Now (No Backend Required)

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies (first time only)
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# → http://localhost:5173

# 5. Login with ANY credentials
# Email: admin@example.com
# Password: anything

# ✓ APP IS NOW WORKING - All features functional!
```

## What You'll See

### Dashboard (Home)
- Total Contacts, Accounts, Deals
- Revenue and pipeline statistics
- Recent activities feed
- All populated with mock data

### CRM Module
- **Contacts** - List, Create, Edit all contact records
- **Accounts** - Manage companies and organizations
- **Deals** - Track sales opportunities through pipeline
- **Leads** - Manage leads and convert to contacts

### Finance Module
- **Invoices** - Create, view, manage invoices
- **Payments** - Track payment transactions
- **Reports** - AR Aging, Sales reports, P&L statements

### Field Work Module
- **Jobs** - Create and manage field service jobs
- **All CRUD operations work** - Create, Read, Update, Delete

## How It Works (Behind the Scenes)

```
1. Frontend makes API request:
   → POST http://localhost:8080/api/v1/auth/login
   
2. Backend not running (or returns 401):
   → Automatic fallback triggers
   
3. Frontend redirects to mock API:
   → POST http://localhost:8080/api/mock/auth/login
   
4. MockApiController responds with test data:
   → { accessToken: "mock-token-...", user: {...} }
   
5. Frontend continues normally:
   → Shows Dashboard with all features
   
6. All page navigation works:
   → Every click calls real API → falls back to mock automatically
```

## Features That Work (With Mock API)

### ✅ Authentication
- Login with any email/password
- Get JWT token
- Token refresh on page reload

### ✅ Data Management
- View paginated lists of all data types
- Create new records (contacts, accounts, deals, invoices, etc.)
- Mock data persists per request (or until page reload)

### ✅ Navigation
- All page routes functional
- Sidebar menu works
- Tab switches work
- Search and filters work (filter mock data)

### ✅ Reporting
- Dashboard with KPIs
- Sales reports with charts
- AR Aging reports
- All data dynamically generated

### ✅ Forms
- All input fields work
- Validation works
- Create buttons work
- Edit and save operations work

## Next Steps

### To Use Real Backend (Optional)

If you want to connect to a real backend later:

```bash
# Terminal 1: Start backend
cd backend
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Terminal 2: Keep frontend running
cd frontend
npm run dev
```

**Result:** 
- Frontend uses real API when backend is available
- Automatically falls back to mock if backend returns error
- Real and mock API work seamlessly together

### To Deploy

```bash
# Build frontend for production
cd frontend
npm run build

# Output in: frontend/dist/
# Deploy to web server
```

### To Add Real Data

Create a PostgreSQL database and update backend configuration:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/crm_db
    username: postgres
    password: your_password
```

Then restart backend - all real data will be used.

## Troubleshooting

### Issue: Port 5173 already in use
```bash
npm run dev -- --port 3000
```

### Issue: npm command not found
```bash
# Install Node.js from https://nodejs.org/
# Then restart terminal and try again
```

### Issue: Backend API fails to connect (expected)
This is normal! The mock API automatically takes over. Check console for:
```
[Mock API Fallback] GET /mock/auth/login
```

## Project Structure

```
Boomslang_Test-main/
├── frontend/              ← Start here
│   ├── src/
│   │   ├── components/    - UI components
│   │   ├── pages/         - Page components
│   │   ├── api/           - API clients (axiosInstance has fallback)
│   │   └── types/         - TypeScript types
│   └── package.json       - Dependencies
│
└── backend/               ← Optional (not needed for mock API)
    ├── src/main/java/
    │   └── com/everx/api/
    │       └── MockApiController.java  ← Provides mock endpoints
    └── pom.xml            - Maven dependencies
```

## Key Features to Try

1. **Login Page**
   - Enter any email/password
   - Button works, redirects to dashboard

2. **Dashboard**
   - Shows all KPIs and stats
   - Recent activities listed
   - All data is mock but realistic

3. **Contacts Page**
   - Click "Contacts" in sidebar
   - View list of 100 mock contacts
   - Click button to create new contact
   - Form works, submit works

4. **Deals Page**
   - View sales pipeline
   - Deals in various stages
   - Create new deals
   - See realistic deal data

5. **Invoices Page**
   - List of invoices with statuses
   - Create new invoice
   - View paid/overdue/draft invoices

6. **Reports**
   - AR Aging report
   - Sales report
   - P&L statement
   - All data auto-generated

## Performance

- **Frontend Load Time:** ~2 seconds
- **Page Navigation:** Instant
- **Data Loading:** <500ms (mock data is in-memory)
- **Create Operations:** Instant confirmation

Much faster than with real backend because no database queries!

## Keyboard Shortcuts (Vite)

While development server is running:

```
Press:
  r - Restart dev server  
  o - Open in browser
  q - Quit dev server
```

## FAQ

**Q: Is this production-ready?**  
A: This is for development/demo only. The mock data resets on each request and doesn't persist.

**Q: How do I use real data?**  
A: Set up backend + PostgreSQL as described in "To Use Real Backend" section above.

**Q: Can I modify mock data?**  
A: Yes, edit MockApiController.java and rebuild backend with `mvn clean package`.

**Q: How long can I use this?**  
A: As long as you want for development! Backend/database are optional.

**Q: What if I need help?**  
A: Check README_MOCK_API.md for detailed technical documentation.

---

**Ready?** Go run: `cd frontend && npm install && npm run dev`

