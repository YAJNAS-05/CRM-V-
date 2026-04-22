# Enterprise System Flaws & Immediate Resolutions

This document provides an executive summary of the critical pain points identified from the user, technical, and architectural perspectives inside the EverX CRM/ERP platform, and the enterprise-level resolutions applied.

## 1. Authentication & Security Flaws

**Identified Issues:**
*   **Silent Token Refresh Failures:** The token refresh interceptor was not robust. If a user's refresh token expired or became invalid, the app silently failed API requests and threw users directly out of their current context without explanation. 
*   **Silent Global Errors:** Any API failure natively threw errors into the console, leading to UI crashes or stagnant states.
*   **Concurrency Race Conditions:** The token refresh interceptor spawned multiple retry promises on parallel network requests, causing network waterfalls and server throttling.

**Enterprise Fixes Implemented:**
*   **Global Error Handling:** Implemented a unified `axiosInstance` interceptor intercepting `400`, `401`, `404`, and `>=500` server responses. Network failures (`ERR_NETWORK`) are now gracefully caught.
*   **Toast Notifications System:** Integrated `react-hot-toast` into the root application (`App.tsx`). This replaces silent console failures with user-facing, non-intrusive notification bubbles (e.g., "Session expired. Please log in again.").
*   **Promise Debouncing:** Added a global `refreshPromise` check to ensure the token is refreshed once, queuing all concurrent calls until the active promise is resolved, significantly reducing backend load.

## 2. Roles and Permissions Flaws

**Identified Issues:**
*   **Non-Deterministic Role Resolution:** In `usePermissions.ts`, the frontend mapped a user's dashboard entry based on whichever role appeared *first* in an array (`user.roles?.find()`). If a user had `[HR, MANAGER, SUPER_ADMIN]`, their primary workspace would assign inconsistently based on backend sorting.
*   **Missing Escalations:** Default fallback defaults were poorly prioritized.

**Enterprise Fixes Implemented:**
*   **Deterministic Priority Resolution:** Hardcoded an enterprise-standard role priority architecture inside `usePermissions.ts`: `[SUPER_ADMIN -> ADMIN -> MANAGER -> SALES_MANAGER -> FINANCE -> HR -> SERVICE_TECH -> SALES_REP -> EMPLOYEE -> VIEWER -> READ_ONLY]`. A multi-role user is always routed to the highest-credential dashboard dynamically.

## 3. Technical & Dynamic UI/UX Flaws

**Identified Issues:**
*   **Data Integrity Failures (Backend):** Due to strict JPA lifecycle sequences, `Invoice` entities were created pointing to `Account` UUIDs that had not natively flushed to the PostgreSQL DB, causing fatal deployment crashes (`Violates not-null constraint`).
*   **Bean Definition Architecture Conflicts:** Attempted to bind `DashboardController` in two distinct packages over the same endpoint registry path.

**Enterprise Fixes Implemented:**
*   **Safe Transaction Flushing:** Rewrote the `MockOperationalDataInitializer.java` mock service to construct initial schemas cleanly and chain `saveAndFlush()` to guarantee Foreign Keys exist dynamically.
*   **Domain-Driven Renaming:** Re-orchestrated the `RoleDashboardMetricsService` and endpoints, solving the Spring Boot `@RestController` Bean naming conflicts preventing startup.

***

*The frontend `react-hot-toast` layer and backend stability fixes have been securely committed. To start the services, simply run `mvn spring-boot:run` in `/backend` and `npm run dev` in `/frontend`.*
