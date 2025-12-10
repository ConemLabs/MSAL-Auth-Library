# MSAL Auth Library

Production-ready authentication library for **React** and **Angular** applications using Microsoft Authentication Library (MSAL). Simplifies Azure AD authentication with automatic token refresh, route protection, and customizable UI.

[![npm version](https://img.shields.io/npm/v/@conemlabs/msal-auth-library.svg)](https://www.npmjs.com/package/@conemlabs/msal-auth-library)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- ✅ **Automatic Token Refresh** - Users stay logged in without re-authentication
- ✅ **React & Angular Support** - Framework-specific implementations
- ✅ **Custom UI Support** - Complete control over authentication UI
- ✅ **Route Protection** - Guards for authenticated routes
- ✅ **HTTP Interceptor** - Auto-inject bearer tokens (Angular)
- ✅ **TypeScript** - Full type safety
- ✅ **Popup & Redirect Flows** - Choose what works best
- ✅ **Error Recovery** - Graceful handling of auth failures

## 📦 Installation

```bash
npm install @conemlabs/msal-auth-library
```

### Peer Dependencies

**React:**
```bash
npm install react react-dom
```

**Angular:**
```bash
npm install @angular/core @angular/common @angular/router @angular/common/http rxjs
```

## 🚀 Quick Start

### React

```tsx
import { AuthenticationWrapper } from '@conemlabs/msal-auth-library';

const config = {
  clientId: 'YOUR_CLIENT_ID',
  tenantId: 'YOUR_TENANT_ID',
  redirectUri: window.location.origin,
  scopes: ['api://YOUR_CLIENT_ID/access_as_user'],
  flowType: 'popup',
};

function App() {
  return (
    <AuthenticationWrapper config={config}>
      <YourApp />
    </AuthenticationWrapper>
  );
}
```

### Angular

```typescript
import { MsalAuthModule } from '@conemlabs/msal-auth-library/angular';

@NgModule({
  imports: [
    MsalAuthModule.forRoot({
      clientId: 'YOUR_CLIENT_ID',
      tenantId: 'YOUR_TENANT_ID',
      redirectUri: window.location.origin,
      scopes: ['api://YOUR_CLIENT_ID/access_as_user'],
      flowType: 'popup',
    })
  ]
})
export class AppModule { }
```

[See QUICKSTART.md for detailed examples →](QUICKSTART.md)

## 📖 Usage Examples

### React with Custom UI

```tsx
import { AuthenticationWrapper, WrapperComponentProps } from '@conemlabs/msal-auth-library';

const CustomWrapper: React.FC<WrapperComponentProps> = ({
  isInitializing,
  isAuthenticated,
  needsLogin,
  authError,
  onLogin,
  onLogout,
  children,
}) => {
  if (isInitializing) return <LoadingSpinner />;
  if (needsLogin) return <CustomLoginPage onLogin={onLogin} error={authError} />;
  return (
    <>
      <Header onLogout={onLogout} />
      {children}
      <Footer />
    </>
  );
};

function App() {
  return (
    <AuthenticationWrapper
      config={config}
      wrapperComponent={CustomWrapper}
    >
      <YourApp />
    </AuthenticationWrapper>
  );
}
```

### React Hook

```tsx
import { useAuthentication } from '@conemlabs/msal-auth-library';

function MyComponent() {
  const { authState, actions } = useAuthentication(config);

  if (authState.isInitializing) return <div>Loading...</div>;
  if (!authState.isAuthenticated) {
    return <button onClick={actions.handleLogin}>Sign In</button>;
  }

  return (
    <div>
      <p>Welcome! Token: {authState.jwtToken}</p>
      <button onClick={actions.handleLogout}>Sign Out</button>
    </div>
  );
}
```

### Angular with Route Guard

```typescript
import { MsalAuthGuard } from '@conemlabs/msal-auth-library/angular';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [MsalAuthGuard], // Protected route
  }
];
```

### Angular HTTP Calls (Auto Token Injection)

```typescript
import { HttpClient } from '@angular/common/http';

@Component({...})
export class DataComponent {
  constructor(private http: HttpClient) {}

  loadData() {
    // Bearer token automatically added!
    this.http.get('https://api.example.com/data')
      .subscribe(data => console.log(data));
  }
}
```

### Getting Access Token

**React:**
```tsx
import { authService } from '@conemlabs/msal-auth-library';

const token = await authService.getAccessToken();
```

**Angular:**
```typescript
import { MsalAuthService } from '@conemlabs/msal-auth-library/angular';

constructor(private authService: MsalAuthService) {}

async callAPI() {
  const token = await this.authService.getAccessTokenAsync();
  // Use token...
}
```

## ⚙️ Configuration

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `clientId` | string | ✅ | - | Azure AD application/client ID |
| `tenantId` | string | ✅ | - | Azure AD tenant ID |
| `redirectUri` | string | ✅ | - | Redirect URI after authentication |
| `scopes` | string[] | ✅ | - | OAuth scopes to request |
| `flowType` | `'popup'` \| `'redirect'` | ❌ | `'popup'` | Authentication flow type |
| `cacheLocation` | `'sessionStorage'` \| `'localStorage'` | ❌ | `'sessionStorage'` | Token cache location |
| `enableLogging` | boolean | ❌ | `false` | Enable debug logging |
| `prompt` | string | ❌ | `'select_account'` | Login prompt behavior |
| `tokenRenewalOffsetSeconds` | number | ❌ | `300` | Token refresh offset (5 min) |

## 🔄 Automatic Token Refresh

Tokens are automatically refreshed **every 30 minutes** in the background. Users stay logged in without interruption unless:

- They haven't used the app for an extended period (Microsoft session expires)
- They explicitly sign out
- All sessions are invalidated by an administrator

**How it works:**
1. Token is cached with 55-minute expiry (5 minutes before actual expiry)
2. Background timer refreshes token every 30 minutes
3. Silent refresh happens without user interaction
4. User never sees login screen unless necessary

## 🎨 Custom UI Components

### React

```tsx
<AuthenticationWrapper
  config={config}
  loadingComponent={<CustomLoader />}
  loginComponent={<CustomLoginPage />}
  errorComponent={(error, retry) => <CustomError error={error} onRetry={retry} />}
>
  <YourApp />
</AuthenticationWrapper>
```

Or use a **custom wrapper** for complete control:

```tsx
<AuthenticationWrapper
  config={config}
  wrapperComponent={YourCustomWrapper}
>
  <YourApp />
</AuthenticationWrapper>
```

[See examples/custom-wrapper.tsx for full example →](examples/custom-wrapper.tsx)

## 📚 API Reference

### React

| Component / Hook | Description |
|-----------------|-------------|
| `AuthenticationWrapper` | Main wrapper component |
| `useAuthentication(config)` | Hook for auth state and actions |
| `authService` | Core service singleton |

### Angular

| Service / Guard | Description |
|----------------|-------------|
| `MsalAuthService` | Injectable authentication service |
| `MsalAuthGuard` | Route guard for protected routes |
| `MsalAuthInterceptor` | HTTP interceptor for token injection |
| `MsalAuthModule` | Main module to import |

### Core Service Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `initialize(config)` | Initialize MSAL | `Promise<void>` |
| `loginInteractive()` | Perform login | `Promise<AuthenticationResult>` |
| `logout()` | Log out user | `Promise<void>` |
| `getAccessToken()` | Get access token with auto-refresh | `Promise<string>` |
| `acquireTokenSilent()` | Silent token acquisition | `Promise<TokenResult>` |
| `isLoggedIn()` | Check if user is logged in | `boolean` |
| `forceRefreshToken()` | Force token refresh | `Promise<string>` |
| `clearAuthenticationState()` | Clear auth state (error recovery) | `Promise<void>` |

## 🛡️ Security Best Practices

- ✅ Tokens are cached in `sessionStorage` by default (cleared on tab close)
- ✅ Automatic token refresh prevents token expiry
- ✅ Silent refresh with no user interruption
- ✅ Graceful error handling and recovery
- ✅ Support for Azure AD multi-factor authentication

## 🏗️ Project Structure

```
@conemlabs/msal-auth-library/
├── core/              # Platform-agnostic core (MSAL wrapper)
│   ├── auth-service.ts
│   └── types.ts
├── react/             # React-specific components and hooks
│   ├── authentication-wrapper.tsx
│   ├── use-authentication.ts
│   └── types.ts
└── angular/           # Angular services, guards, interceptors
    ├── msal-auth.service.ts
    ├── msal-auth.guard.ts
    ├── msal-auth.interceptor.ts
    └── msal-auth.module.ts
```

## 🧪 Testing Locally

```bash
# Build the library
npm run build

# Link globally
npm link

# In your test project
npm link @conemlabs/msal-auth-library
```

## 📝 Examples

- [Basic React App](examples/basic-react-app.tsx)
- [Custom Wrapper Component](examples/custom-wrapper.tsx)

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## 📄 License

MIT © Conem Labs

## 🔗 Links

- [Azure AD Documentation](https://docs.microsoft.com/en-us/azure/active-directory/)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)

## 💬 Support

- 📧 Email: support@conemlabs.com
- 🐛 Issues: [GitHub Issues](https://github.com/conemlabs/msal-auth-library/issues)
- 📖 Docs: [Documentation](https://github.com/conemlabs/msal-auth-library#readme)

## 📦 Publishing

The repository uses GitHub Actions to automatically publish to npm on pushes to `main`. The workflow:
- Builds the package with `npm run build`
- Bumps the patch version (e.g., `v1.0.1`)
- Creates a git tag and pushes it
- Publishes to npm using the `NPM_TOKEN` secret

**Setup:** Add an `NPM_TOKEN` secret in your GitHub repository settings with a scoped npm automation token.

---

**Made with ❤️ by Conem Labs**
