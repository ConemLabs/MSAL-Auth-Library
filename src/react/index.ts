/**
 * MSAL Auth Library - React
 * React-specific wrapper for MSAL authentication
 */

// Export React components and hooks
export { AuthenticationWrapper } from './authentication-wrapper';
export { useAuthentication } from './use-authentication';

// Export React-specific types
export type {
  AuthenticationActions,
  UseAuthenticationResult,
  AuthenticationWrapperProps,
  WrapperComponentProps,
  DefaultLoadingComponentProps,
  DefaultLoginComponentProps,
} from './types';

// Re-export core functionality for convenience
export { MsalAuthService, authService } from '../core/auth-service';

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
