/**
 * MSAL Auth Library - Angular
 * Angular-specific wrapper for MSAL authentication
 */

// Export Angular module and components
export { MsalAuthModule, MSAL_CONFIG } from './msal-auth.module';
export { MsalAuthService } from './msal-auth.service';
export { MsalAuthGuard } from './msal-auth.guard';
export { MsalAuthInterceptor } from './msal-auth.interceptor';

// Re-export core functionality
export { MsalAuthService as CoreAuthService, authService } from '../core/auth-service';

// Re-export all types
export type {
  MsalAuthConfig,
  AuthFlowType,
  AuthenticationState,
  TokenResult,
  AuthServiceStatus,
  AccountInfo,
  AuthenticationResult,
} from '../core/types';
