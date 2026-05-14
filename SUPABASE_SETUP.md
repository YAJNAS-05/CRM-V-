# Supabase Setup for EverX CRM/ERP

## Project Details
- **Project URL**: https://epkxbbcmztgrefxfrdvh.supabase.co
- **REST API**: https://epkxbbcmztgrefxfrdvh.supabase.co/rest/v1/

## Setup Instructions

### 1. Run SQL Migrations in Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/epkxbbcmztgrefxfrdvh)
2. Navigate to **SQL Editor** → **New Query**
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run**
5. Repeat for `supabase/migrations/002_rls_policies.sql`

### 2. Get Your Service Role Key

1. In Supabase Dashboard, go to **Project Settings** → **API**
2. Copy the **service_role key** (keep this secret!)
3. Add to your backend `.env` file

### 3. Frontend Environment Variables

Create `frontend/.env`:
```bash
VITE_SUPABASE_URL=https://epkxbbcmztgrefxfrdvh.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_ZBNkk8wDYSqpkiM8e3IZOQ_SlZJMJwL
```

### 4. Install Dependencies

```bash
cd frontend
npm install @supabase/supabase-js
```

For backend (if using Supabase from Java):
```bash
# Add to pom.xml
<dependency>
    <groupId>io.github.jamsesso</groupId>
    <artifactId>jsonlogic</artifactId>
    <version>1.0.0</version>
</dependency>
```

### 5. Enable Realtime (Optional)

In Supabase Dashboard:
1. Go to **Database** → **Replication**
2. Enable **Realtime** for tables you want to subscribe to

## Database Schema Overview

### Auth & RBAC Tables
- `users` - Extended user profiles
- `roles` - Role definitions
- `permissions` - Permission definitions
- `user_roles` - User-Role assignments
- `role_permissions` - Role-Permission assignments

### CRM Tables
- `accounts` - Company/Organization accounts
- `contacts` - Individual contacts
- `leads` - Sales leads
- `deals` - Sales opportunities
- `deal_stages` - Pipeline stages
- `activities` - Tasks, calls, meetings
- `quotes` - Price quotes
- `quote_line_items` - Quote details

### ERP Tables
- `equipment` - Equipment inventory
- `inventory_items` - Product catalog
- `inventory_bins` - Storage locations
- `inventory_stock` - Stock levels
- `purchase_orders` - POs
- `purchase_order_items` - PO line items
- `suppliers` - Vendor directory

### Finance Tables
- `invoices` - Customer invoices
- `payments` - Payment records

### HR Tables
- `departments` - Company departments
- `employees` - Employee records

## Row Level Security (RLS)

All tables have RLS enabled with policies based on:
- **Owner-based access** - Users can access their own records
- **Role-based access** - Based on assigned roles
- **Permission-based access** - Granular permissions

### Default Roles
- `SUPER_ADMIN` - Full system access
- `ADMIN` - Administrative access
- `MANAGER` - Team management
- `SALES_REP` - Sales operations
- `SALES_MANAGER` - Sales team management
- `HR` - Human resources
- `FINANCE` - Financial operations
- `VIEWER` - Read-only access
- `EMPLOYEE` - Standard employee

### Default Permissions
Permissions follow pattern: `{module}:{action}`
- `users:read`, `users:create`, `users:update`, `users:delete`
- `accounts:read`, `accounts:create`, `accounts:update`, `accounts:delete`
- `leads:read`, `leads:create`, `leads:update`, `leads:delete`, `leads:convert`
- `deals:read`, `deals:create`, `deals:update`, `deals:delete`
- `inventory:read`, `inventory:create`, `inventory:update`, `inventory:delete`
- `invoices:read`, `invoices:create`, `invoices:update`, `invoices:delete`

## Frontend Usage Examples

### Authentication
```typescript
import { useAuth } from './hooks/useSupabase';

const { user, signIn, signUp, signOut } = useAuth();

// Sign in
await signIn('user@example.com', 'password');

// Sign up
await signUp('user@example.com', 'password', {
  first_name: 'John',
  last_name: 'Doe',
  full_name: 'John Doe'
});
```

### Data Fetching
```typescript
import { useSupabaseQuery } from './hooks/useSupabase';

// Fetch leads
const { data: leads, loading, error } = useSupabaseQuery('leads', {
  filters: { status: 'NEW' },
  orderBy: { column: 'created_at', ascending: false },
  page: 0,
  pageSize: 20
});

// Fetch single item
const { data: lead } = useSupabaseItem('leads', leadId);
```

### CRUD Operations
```typescript
import { useSupabaseMutations } from './hooks/useSupabase';

const { create, update, remove, softDelete } = useSupabaseMutations('leads');

// Create
await create({
  first_name: 'Jane',
  last_name: 'Smith',
  email: 'jane@example.com',
  status: 'NEW'
});

// Update
await update(leadId, { status: 'CONTACTED' });

// Soft delete
await softDelete(leadId);
```

### Realtime Subscriptions
```typescript
import { useSupabaseRealtime } from './hooks/useSupabase';

useSupabaseRealtime('deals', undefined, (payload) => {
  console.log('Deal changed:', payload);
  // Refresh data or update UI
});
```

### RBAC Checks
```typescript
import { useRBAC } from './hooks/useSupabase';

const { hasPermission, hasRole, isAdmin, isSuperAdmin } = useRBAC();

// Check permission
const canCreateLeads = await hasPermission('leads:create');

// Check role
const isManager = await hasRole('MANAGER');
```

## Backend Integration (Java/Spring Boot)

If you want to use Supabase from your Spring Boot backend:

### 1. Add RestTemplate configuration
```java
@Configuration
public class SupabaseConfig {
    @Value("${supabase.url}")
    private String supabaseUrl;
    
    @Value("${supabase.service-key}")
    private String serviceKey;
    
    @Bean
    public RestTemplate supabaseRestTemplate() {
        RestTemplate template = new RestTemplate();
        template.getInterceptors().add((request, body, execution) -> {
            request.getHeaders().set("apikey", serviceKey);
            request.getHeaders().set("Authorization", "Bearer " + serviceKey);
            return execution.execute(request, body);
        });
        return template;
    }
}
```

### 2. Example Service
```java
@Service
public class SupabaseLeadService {
    @Autowired
    private RestTemplate supabaseRestTemplate;
    
    @Value("${supabase.url}")
    private String supabaseUrl;
    
    public List<Lead> getAllLeads() {
        String url = supabaseUrl + "/rest/v1/leads?select=*&is_deleted=eq.false";
        return Arrays.asList(supabaseRestTemplate.getForObject(url, Lead[].class));
    }
}
```

## Storage Buckets Setup

Create these buckets in Supabase Dashboard → Storage:
- `avatars` - User profile pictures
- `documents` - CRM documents
- `invoices` - Invoice PDFs
- `equipment` - Equipment photos

## Post-Setup Checklist

- [ ] Run SQL migrations in Supabase dashboard
- [ ] Configure frontend environment variables
- [ ] Install frontend dependencies
- [ ] Create storage buckets
- [ ] Test authentication
- [ ] Verify RLS policies work correctly
- [ ] Set up realtime subscriptions if needed
