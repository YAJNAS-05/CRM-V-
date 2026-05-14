# Multi-Auth OAuth Setup Guide

## Overview

The EverX application now supports multiple OAuth authentication providers through Supabase, including:

- **Google**
- **GitHub**
- **Discord**
- **Azure AD** (Entra ID)

This guide walks through setting up OAuth providers in Supabase and configuring your application.

## Prerequisites

- Supabase project already created (https://epkxbbcmztgrefxfrdvh.supabase.co)
- Access to provider credential management consoles
- Frontend environment variables configured

## Step 1: Configure Frontend Environment

Create or update `frontend/.env`:

```bash
VITE_SUPABASE_URL=https://epkxbbcmztgrefxfrdvh.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_ZBNkk8wDYSqpkiM8e3IZOQ_SlZJMJwL
```

## Step 2: Set Up OAuth Providers in Supabase

### 2.1 Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **Credentials** > **Create Credentials** > **OAuth client ID**
4. Select **Web application**
5. Add authorized redirect URIs:
   - `https://epkxbbcmztgrefxfrdvh.supabase.co/auth/v1/callback`
   - `http://localhost:5173/auth/callback` (for development)
6. Copy **Client ID** and **Client Secret**
7. In Supabase Dashboard:
   - Go to **Authentication** > **Providers** > **Google**
   - Paste **Client ID** and **Client Secret**
   - Enable the provider

### 2.2 GitHub OAuth

1. Go to GitHub Settings > [Developer settings](https://github.com/settings/developers) > OAuth Apps
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: EverX CRM
   - **Homepage URL**: `https://epkxbbcmztgrefxfrdvh.supabase.co`
   - **Authorization callback URL**: `https://epkxbbcmztgrefxfrdvh.supabase.co/auth/v1/callback`
4. Copy **Client ID** and **Client Secret**
5. In Supabase Dashboard:
   - Go to **Authentication** > **Providers** > **GitHub**
   - Paste **Client ID** and **Client Secret**
   - Enable the provider

### 2.3 Discord OAuth

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** and name it "EverX CRM"
3. Go to **OAuth2** > **General**
4. Copy **Client ID**
5. Go to **Client Secret** and copy it
6. Scroll to **Redirects** and add:
   - `https://epkxbbcmztgrefxfrdvh.supabase.co/auth/v1/callback`
7. In Supabase Dashboard:
   - Go to **Authentication** > **Providers** > **Discord**
   - Paste **Client ID** and **Client Secret**
   - Enable the provider

### 2.4 Azure AD (Entra ID) OAuth

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** > **App registrations** > **New registration**
3. Fill in:
   - **Name**: EverX CRM
   - **Supported account types**: Multitenant
   - **Redirect URI**: Select **Web** and enter `https://epkxbbcmztgrefxfrdvh.supabase.co/auth/v1/callback`
4. Copy **Application (client) ID**
5. Go to **Certificates & secrets** > **Client secrets** > **New client secret**
6. Copy the secret value
7. In Supabase Dashboard:
   - Go to **Authentication** > **Providers** > **Azure**
   - Paste **Client ID** and **Client Secret**
   - Enable the provider

## Step 3: Test OAuth Integration

### Frontend Login Page

The login page now includes OAuth buttons:
- Click any provider button to initiate OAuth flow
- User is redirected to provider login
- After authentication, redirected back to `/auth/callback`
- Session is automatically established and user logged in

### Profile Page - Manage Connected Accounts

Users can:
1. Navigate to **Profile** (click profile icon in top-right)
2. Scroll to **Connected Accounts** section
3. **Link new provider**: Click the provider's "Link" button
4. **Remove provider**: Click "Remove" on connected providers
5. Only OAuth-only accounts cannot remove their sole authentication method

## Step 4: Backend Integration (Optional)

If your backend needs to validate OAuth tokens or create/sync users:

### Backend Setup in Java

1. Add Supabase dependencies to `backend/pom.xml`:

```xml
<dependency>
    <groupId>com.google.auth</groupId>
    <artifactId>google-auth-library-oauth2-http</artifactId>
    <version>1.11.1</version>
</dependency>

<dependency>
    <groupId>com.google.auth</groupId>
    <artifactId>google-auth-library-appengine</artifactId>
    <version>1.11.1</version>
</dependency>
```

2. Add authentication filter to verify Supabase JWT:

```java
@Component
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/v1/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            );
        return http.build();
    }
}
```

## Step 5: Database Synchronization

Create a backend endpoint to sync OAuth user profiles:

```typescript
// Frontend
const syncProfile = async (oauthUser: any) => {
  const response = await axiosInstance.post('/v1/auth/sync-oauth-profile', {
    email: oauthUser.email,
    fullName: oauthUser.user_metadata?.full_name,
    avatarUrl: oauthUser.user_metadata?.avatar_url,
    provider: 'google', // or github, discord, azure
  })
  return response.data
}
```

## Security Best Practices

✅ **Do's**:
- Keep client secrets secure (never commit to version control)
- Use HTTPS for all OAuth redirect URIs
- Validate ID tokens on the backend
- Store refresh tokens securely
- Implement rate limiting on auth endpoints
- Log authentication events

❌ **Don'ts**:
- Don't expose client secrets in frontend code
- Don't use HTTP for production redirects
- Don't trust client-side authentication alone
- Don't store plain-text passwords when using OAuth
- Don't skip email verification for OAuth accounts

## Troubleshooting

### "Invalid redirect URI"
- Ensure the redirect URI exactly matches what's registered in the provider
- For development, use `http://localhost:5173/auth/callback`
- For production, use `https://yourdomain.com/auth/callback`

### "Failed to sign in with [provider]"
- Check that the provider is enabled in Supabase Dashboard
- Verify Client ID and Client Secret are correct
- Ensure redirect URI is registered with the provider

### User profile not syncing
- Check browser console for errors
- Verify Supabase JWT is valid on backend
- Check database logs for sync endpoint errors

### "CORS error" during OAuth
- This is usually expected - OAuth flow handles redirects, not CORS requests
- Ensure Supabase project URL is correct in `.env`

## User Experience Flow

### First-time OAuth Login
1. User clicks OAuth provider button
2. Redirected to provider login
3. User grants permissions
4. Redirected to `/auth/callback`
5. Account created automatically
6. User logged in and redirected to dashboard

### Linking OAuth to Existing Account
1. User already logged in
2. Goes to Profile > Connected Accounts
3. Clicks "Link" on new provider
4. OAuth flow same as above
5. Account linked to existing user record

### Unlinking OAuth Provider
1. User goes to Profile > Connected Accounts
2. Clicks "Remove" on connected provider
3. Provider unlinked
4. User can still login with other methods

## Support & Documentation

- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- OAuth 2.0 Spec: https://tools.ietf.org/html/rfc6749
- Individual Provider Docs:
  - [Google OAuth](https://developers.google.com/identity/protocols/oauth2)
  - [GitHub OAuth](https://docs.github.com/en/developers/apps/building-oauth-apps)
  - [Discord OAuth](https://discord.com/developers/docs/topics/oauth2)
  - [Azure AD](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-protocols-oidc)
