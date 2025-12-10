/**
 * Type definitions for MSAL Auth Library (Platform Agnostic)
 */

import { AccountInfo, AuthenticationResult } from '@azure/msal-browser';

/**
 * Authentication flow type - popup or redirect
 */
export type AuthFlowType = 'popup' | 'redirect';

/**
 * Configuration for MSAL authentication
 */
export interface MsalAuthConfig {
  /**
   * Azure AD client/application ID
   */
  clientId: string;

  /**
   * Azure AD tenant ID or 'common', 'organizations', 'consumers'
   */
  tenantId: string;

  /**
   * Redirect URI for your application
   */
  redirectUri: string;

  /**
   * Scopes to request during authentication
   */
  scopes: string[];

  /**
   * Authentication flow type: 'popup' (default) or 'redirect'
   * - popup: Opens authentication in a popup window (works in iframes, Azure DevOps extensions)
   * - redirect: Redirects the entire page to Microsoft login
   */
  flowType?: AuthFlowType;

  /**
   * Cache location: 'sessionStorage' (default) or 'localStorage'
   */
  cacheLocation?: 'sessionStorage' | 'localStorage';

  /**
   * Whether to navigate to the original request URL after redirect
   * Only applies to redirect flow
   */
  navigateToLoginRequestUrl?: boolean;

  /**
   * Prompt type for login: 'select_account', 'login', 'consent', 'none'
   */
  prompt?: 'select_account' | 'login' | 'consent' | 'none';

  /**
   * Enable verbose logging for debugging
   */
  enableLogging?: boolean;

  /**
   * Custom authority URL (optional, constructed from tenantId if not provided)
   */
  authority?: string;

  /**
   * Post-logout redirect URI (optional)
   */
  postLogoutRedirectUri?: string;

  /**
   * Token renewal offset in seconds (default: 300 = 5 minutes)
   */
  tokenRenewalOffsetSeconds?: number;
}

/**
 * Authentication state (platform agnostic)
 */
export interface AuthenticationState {
  /**
   * Whether the authentication system is initializing
   */
  isInitializing: boolean;

  /**
   * Whether the user is authenticated
   */
  isAuthenticated: boolean;

  /**
   * Whether the user needs to log in
   */
  needsLogin: boolean;

  /**
   * Any authentication error that occurred
   */
  authError: string | null;

  /**
   * The current JWT access token
   */
  jwtToken: string | null;

  /**
   * Whether running in iframe context
   */
  isInIframe: boolean;

  /**
   * Whether SDK has been initialized
   */
  sdkInitialized: boolean;
}

/**
 * Result of token acquisition
 */
export interface TokenResult {
  /**
   * The access token
   */
  accessToken: string;

  /**
   * Token expiration time
   */
  expiresOn: Date | null;

  /**
   * The account that was authenticated
   */
  account: AccountInfo | null;
}

/**
 * Internal auth service status for debugging
 */
export interface AuthServiceStatus {
  isInitialized: boolean;
  hasToken: boolean;
  tokenExpiry: number | null;
  isLoginInProgress: boolean;
  accountCount: number;
  flowType: AuthFlowType;
}

export type { AccountInfo, AuthenticationResult };
