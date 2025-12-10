/**
 * React-specific type definitions for MSAL Auth Library
 */

import { ReactNode } from 'react';
import { MsalAuthConfig, AuthenticationState } from '../core/types';

/**
 * Authentication actions for React components
 */
export interface AuthenticationActions {
  /**
   * Initiate login flow
   */
  handleLogin: () => Promise<void>;

  /**
   * Log out the current user
   */
  handleLogout: () => Promise<void>;

  /**
   * Force refresh the page
   */
  handleForceRefresh: () => Promise<void>;

  /**
   * Clear authentication state (useful for error recovery)
   */
  handleClearAuthState?: () => Promise<void>;
}

/**
 * Authentication hook result
 */
export interface UseAuthenticationResult {
  /**
   * Current authentication state
   */
  authState: AuthenticationState;

  /**
   * Available authentication actions
   */
  actions: AuthenticationActions;

  /**
   * Whether running in iframe context
   */
  IS_IN_IFRAME: boolean;
}

/**
 * Props for default loading component
 */
export interface DefaultLoadingComponentProps {
  message?: string;
}

/**
 * Props for default login component
 */
export interface DefaultLoginComponentProps {
  onLogin: () => void;
  error: string | null;
  title?: string;
  description?: string;
  buttonText?: string;
}

/**
 * Props for custom wrapper component
 */
export interface WrapperComponentProps {
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
   * Handler to initiate login
   */
  onLogin: () => void;

  /**
   * Handler to logout
   */
  onLogout: () => void;

  /**
   * The authenticated content to render
   */
  children: ReactNode;
}

/**
 * Props for AuthenticationWrapper component
 */
export interface AuthenticationWrapperProps {
  /**
   * Configuration for MSAL authentication
   */
  config: MsalAuthConfig;

  /**
   * Child components to render when authenticated
   */
  children: ReactNode;

  /**
   * Callback invoked after successful authentication
   */
  onAuthSuccess?: () => Promise<void>;

  /**
   * Whether to show the authentication status banner
   */
  showAuthStatus?: boolean;

  /**
   * Custom loading component
   */
  loadingComponent?: ReactNode;

  /**
   * Custom login component
   */
  loginComponent?: ReactNode;

  /**
   * Custom error component
   */
  errorComponent?: (error: string, retry: () => void) => ReactNode;

  /**
   * Custom wrapper component that controls the entire authentication UI flow
   * When provided, this component will receive authentication state and must
   * handle rendering of loading, login, error, and authenticated states.
   * This overrides loadingComponent, loginComponent, and errorComponent props.
   */
  wrapperComponent?: React.ComponentType<WrapperComponentProps>;
}

// Re-export core types for convenience
export type {
  MsalAuthConfig,
  AuthFlowType,
  AuthenticationState,
  TokenResult,
  AuthServiceStatus,
  AccountInfo,
  AuthenticationResult,
} from '../core/types';
