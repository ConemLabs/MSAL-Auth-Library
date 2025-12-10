# MSAL Auth Library - Angular Usage

Angular services, guards, and interceptors for Microsoft Authentication Library (MSAL) integration.

## Installation

```bash
npm install @conemlabs/msal-auth-library
```

## Peer Dependencies

```bash
npm install @angular/core @angular/common @angular/router @angular/common/http rxjs
```

## Quick Start

### 1. Configure in App Module

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MsalAuthModule, MsalAuthConfig } from '@conemlabs/msal-auth-library/angular';

const msalConfig: MsalAuthConfig = {
  clientId: 'YOUR_CLIENT_ID',
  tenantId: 'YOUR_TENANT_ID',
  redirectUri: window.location.origin,
  scopes: ['api://YOUR_CLIENT_ID/access_as_user'],
  flowType: 'popup',
  enableLogging: true,
};

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    MsalAuthModule.forRoot(msalConfig),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### 2. Use in Components

```typescript
import { Component, OnInit } from '@angular/core';
import { MsalAuthService } from '@conemlabs/msal-auth-library/angular';

@Component({
  selector: 'app-root',
  template: `
    <div *ngIf="authState$ | async as auth">
      <div *ngIf="auth.isInitializing">Loading...</div>
      <div *ngIf="auth.needsLogin">
        <button (click)="login()">Sign In</button>
      </div>
      <div *ngIf="auth.isAuthenticated">
        <router-outlet></router-outlet>
        <button (click)="logout()">Sign Out</button>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  authState$ = this.authService.authState$;

  constructor(private authService: MsalAuthService) {}

  async ngOnInit() {
    const config: MsalAuthConfig = {
      clientId: 'YOUR_CLIENT_ID',
      tenantId: 'YOUR_TENANT_ID',
      redirectUri: window.location.origin,
      scopes: ['api://YOUR_CLIENT_ID/access_as_user'],
      flowType: 'popup',
    };
    await this.authService.initialize(config);
  }

  async login() {
    await this.authService.login();
  }

  async logout() {
    await this.authService.logout();
  }
}
```

### 3. Protect Routes

```typescript
import { MsalAuthGuard } from '@conemlabs/msal-auth-library/angular';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [MsalAuthGuard],
  }
];
```

### 4. Automatic Token Injection

HTTP interceptor automatically adds tokens to requests:

```typescript
// Token automatically added!
this.http.get('https://api.example.com/data').subscribe(data => {
  console.log(data);
});
```

## Features

- ✅ Automatic token refresh (users stay logged in)
- ✅ Route guards for protected pages
- ✅ HTTP interceptor (auto bearer token)
- ✅ RxJS Observable state management
- ✅ Works in iframes (Azure DevOps)

## API

- `authService.initialize(config)` - Setup MSAL
- `authService.login()` - Interactive login
- `authService.logout()` - Logout
- `authService.getAccessToken()` - Get token (Observable)
- `authService.getAccessTokenAsync()` - Get token (Promise)
- `authService.authState$` - Observable state

See main README for complete documentation.
