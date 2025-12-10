/**
 * MSAL Auth Library - Core (Platform Agnostic)
 * This module contains the core authentication logic that can be used
 * across different frameworks (React, Angular, Vue, etc.)
 */

// Export service
export { MsalAuthService, authService } from './auth-service';

// Export types
export type {
  MsalAuthConfig,
  AuthFlowType,
  AuthenticationState,
  TokenResult,
  AuthServiceStatus,
  AccountInfo,
  AuthenticationResult,
} from './types';
