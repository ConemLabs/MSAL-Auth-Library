# MSAL Auth Library - Quick Start Guide

Get up and running with MSAL authentication in minutes!

## Table of Contents

- [React Quick Start](#react-quick-start)
- [Angular Quick Start](#angular-quick-start)
- [Custom UI Components](#custom-ui-components)
- [Advanced Usage](#advanced-usage)

---

## React Quick Start

### Step 1: Install

```bash
npm install @conemlabs/msal-auth-library react react-dom
```

### Step 2: Get Azure AD Credentials

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Create a new app registration or select existing
4. Note your:
   - **Client ID** (Application ID)
   - **Tenant ID** (Directory ID)
5. Configure **Authentication**:
   - Add platform: **Single-page application**
   - Add redirect URI: `http://localhost:3000` (or your app URL)
6. Configure **API permissions**:
   - Add the scopes your app needs

### Step 3: Basic Implementation

```tsx
// src/App.tsx
import React from 'react';
import { AuthenticationWrapper } from '@conemlabs/msal-auth-library';

const authConfig = {
  clientId: 'YOUR_CLIENT_ID',
  tenantId: 'YOUR_TENANT_ID',
  redirectUri: window.location.origin,
  scopes: ['api://YOUR_CLIENT_ID/access_as_user'],
  flowType: 'popup', // or 'redirect'
};

function App() {
  return (
    <AuthenticationWrapper config={authConfig}>
      <div>
        <h1>My Secure App</h1>
        <p>You are authenticated!</p>
      </div>
    </AuthenticationWrapper>
  );
}

export default App;
```

### Step 4: Run Your App

```bash
npm start
```

**That's it!** Your app now has:
- ✅ Automatic login/logout
- ✅ Token management
- ✅ Automatic token refresh
- ✅ Error handling

---

## Angular Quick Start

### Step 1: Install

```bash
npm install @conemlabs/msal-auth-library @angular/core @angular/common @angular/router @angular/common/http rxjs
```

### Step 2: Configure App Module

```typescript
// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MsalAuthModule } from '@conemlabs/msal-auth-library/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

const msalConfig = {
  clientId: 'YOUR_CLIENT_ID',
  tenantId: 'YOUR_TENANT_ID',
  redirectUri: window.location.origin,
  scopes: ['api://YOUR_CLIENT_ID/access_as_user'],
  flowType: 'popup',
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    MsalAuthModule.forRoot(msalConfig), // Add this
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### Step 3: Initialize in App Component

```typescript
// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { MsalAuthService } from '@conemlabs/msal-auth-library/angular';

@Component({
  selector: 'app-root',
  template: `
    <div *ngIf="authState$ | async as auth">
      <!-- Loading -->
      <div *ngIf="auth.isInitializing" class="loading">
        <h2>Loading...</h2>
      </div>

      <!-- Login Screen -->
      <div *ngIf="!auth.isAuthenticated && auth.needsLogin" class="login">
        <h2>Please Sign In</h2>
        <button (click)="login()">Sign In with Microsoft</button>
        <div *ngIf="auth.authError" class="error">{{ auth.authError }}</div>
      </div>

      <!-- Authenticated Content -->
      <div *ngIf="auth.isAuthenticated">
        <header>
          <h1>My Secure App</h1>
          <button (click)="logout()">Sign Out</button>
        </header>
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .loading, .login { text-align: center; padding: 2rem; }
    .error { color: red; margin-top: 1rem; }
    header { display: flex; justify-content: space-between; padding: 1rem; background: #f0f0f0; }
  `]
})
export class AppComponent implements OnInit {
  authState$ = this.authService.authState$;

  constructor(private authService: MsalAuthService) {}

  async ngOnInit() {
    const config = {
      clientId: 'YOUR_CLIENT_ID',
      tenantId: 'YOUR_TENANT_ID',
      redirectUri: window.location.origin,
      scopes: ['api://YOUR_CLIENT_ID/access_as_user'],
      flowType: 'popup' as const,
    };
    await this.authService.initialize(config);
  }

  async login() {
    try {
      await this.authService.login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  async logout() {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
}
```

### Step 4: Protect Routes

```typescript
// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalAuthGuard } from '@conemlabs/msal-auth-library/angular';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [MsalAuthGuard], // Protected route
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

### Step 5: Run Your App

```bash
ng serve
```

---

## Custom UI Components

### React - Custom Login/Loading UI

```tsx
import { AuthenticationWrapper } from '@conemlabs/msal-auth-library';

function CustomLoader() {
  return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <div className="spinner"></div>
      <h2>Setting up your workspace...</h2>
    </div>
  );
}

function CustomLogin() {
  return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <h1>Welcome to My App!</h1>
      <p>Please sign in to continue</p>
      {/* Button handled automatically by wrapper */}
    </div>
  );
}

function App() {
  return (
    <AuthenticationWrapper
      config={authConfig}
      loadingComponent={<CustomLoader />}
      loginComponent={<CustomLogin />}
      errorComponent={(error, retry) => (
        <div style={{ color: 'red' }}>
          <p>Error: {error}</p>
          <button onClick={retry}>Try Again</button>
        </div>
      )}
    >
      <YourApp />
    </AuthenticationWrapper>
  );
}
```

### React - Full Custom Wrapper

For **complete control** over the entire authentication UI:

```tsx
import { AuthenticationWrapper, WrapperComponentProps } from '@conemlabs/msal-auth-library';

const CustomAuthWrapper: React.FC<WrapperComponentProps> = ({
  isInitializing,
  isAuthenticated,
  needsLogin,
  authError,
  onLogin,
  onLogout,
  children,
}) => {
  // Loading state
  if (isInitializing) {
    return <YourCustomLoadingScreen />;
  }

  // Not authenticated
  if (!isAuthenticated && needsLogin) {
    return (
      <YourCustomLoginPage
        onLogin={onLogin}
        error={authError}
      />
    );
  }

  // Authenticated - render with your layout
  return (
    <div>
      <YourCustomHeader onLogout={onLogout} />
      <main>{children}</main>
      <YourCustomFooter />
    </div>
  );
};

function App() {
  return (
    <AuthenticationWrapper
      config={authConfig}
      wrapperComponent={CustomAuthWrapper}
    >
      <YourApp />
    </AuthenticationWrapper>
  );
}
```

---

## Advanced Usage

### Getting Access Token (React)

```tsx
import { authService } from '@conemlabs/msal-auth-library';

async function callAPI() {
  try {
    const token = await authService.getAccessToken();
    
    const response = await fetch('https://api.example.com/data', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
  }
}
```

### Using the Hook (React)

```tsx
import { useAuthentication } from '@conemlabs/msal-auth-library';

function MyComponent() {
  const { authState, actions, IS_IN_IFRAME } = useAuthentication(authConfig);

  if (authState.isInitializing) {
    return <div>Loading...</div>;
  }

  if (!authState.isAuthenticated) {
    return <button onClick={actions.handleLogin}>Sign In</button>;
  }

  return (
    <div>
      <p>Welcome! JWT: {authState.jwtToken}</p>
      <button onClick={actions.handleLogout}>Sign Out</button>
      <button onClick={actions.handleForceRefresh}>Refresh Page</button>
      {IS_IN_IFRAME && <p>Running in iframe (Azure DevOps mode)</p>}
    </div>
  );
}
```

### Automatic HTTP Token Injection (Angular)

The HTTP interceptor is automatically configured. All HTTP calls get the token:

```typescript
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DataService {
  constructor(private http: HttpClient) {}

  getData() {
    // Token automatically added to Authorization header!
    return this.http.get('https://api.example.com/data');
  }

  postData(data: any) {
    // Works for all HTTP methods
    return this.http.post('https://api.example.com/data', data);
  }
}
```

### Manual Token Access (Angular)

```typescript
import { MsalAuthService } from '@conemlabs/msal-auth-library/angular';

@Component({...})
export class MyComponent {
  constructor(private authService: MsalAuthService) {}

  async callAPI() {
    // Get token as Promise
    const token = await this.authService.getAccessTokenAsync();

    // Or get as Observable
    this.authService.getAccessToken().subscribe(token => {
      console.log('Token:', token);
    });

    // Use token...
  }
}
```

### Error Recovery

If authentication gets stuck, clear the state:

**React:**
```tsx
const { actions } = useAuthentication(config);
await actions.handleClearAuthState();
```

**Angular:**
```typescript
await this.authService.clearAuthenticationState();
```

---

## Configuration Options Explained

```typescript
const config = {
  // Required
  clientId: 'xxx',           // Azure AD App ID
  tenantId: 'xxx',           // Azure AD Tenant ID
  redirectUri: 'xxx',        // Where to redirect after login
  scopes: ['xxx'],           // Permissions to request

  // Optional
  flowType: 'popup',         // 'popup' (no page reload) or 'redirect'
  cacheLocation: 'sessionStorage', // Where to store tokens
  enableLogging: true,       // Show debug logs
  prompt: 'select_account',  // Force account selection
  tokenRenewalOffsetSeconds: 300, // Refresh 5 min before expiry
};
```

### When to use Popup vs Redirect?

**Use Popup (`flowType: 'popup'`):**
- ✅ Better UX (no page reload)
- ✅ Required for iframes (Azure DevOps extensions)
- ✅ Keeps user's place in the app

**Use Redirect (`flowType: 'redirect'`):**
- ✅ Better mobile experience
- ✅ Works when popups are blocked
- ✅ Simpler flow

---

## Troubleshooting

### Login Not Working?

1. Check Azure AD configuration:
   - Redirect URI matches exactly
   - Platform is set to "Single-page application"
   - Scopes are granted

2. Check console for errors (enable logging):
   ```typescript
   config: { ..., enableLogging: true }
   ```

3. Clear authentication state:
   ```typescript
   await authService.clearAuthenticationState();
   ```

### Token Not Being Added to HTTP Requests?

**Angular:** Make sure `HttpClientModule` is imported before `MsalAuthModule`

**React:** Use `authService.getAccessToken()` to manually get token

### Stuck on "Loading..."?

Clear browser storage and try again:
```typescript
sessionStorage.clear();
localStorage.clear();
```

---

## Next Steps

- 📖 Read the full [README](README.md)
- 🎨 See [custom wrapper example](examples/custom-wrapper.tsx)
- 🏗️ Check out [ARCHITECTURE](ARCHITECTURE.md)
- 📝 View [full API reference](README.md#api-reference)

---

**Questions?** Open an issue on [GitHub](https://github.com/conemlabs/msal-auth-library/issues)
