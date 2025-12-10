import { useState, useEffect } from 'react';
import { authService } from '../core/auth-service';
import { MsalAuthConfig, AuthenticationState } from '../core/types';
import {
  AuthenticationActions,
  UseAuthenticationResult,
} from './types';

/**
 * Check if running in iframe context
 */
const checkIframeContext = (): boolean => {
  try {
    const inIframe = window.self !== window.top;
    console.log('[MSAL Auth] Running in iframe:', inIframe);
    return inIframe;
  } catch (error) {
    console.log('[MSAL Auth] Error checking iframe context:', error);
    return true; // Assume iframe if we can't check
  }
};

const IS_IN_IFRAME = checkIframeContext();

/**
 * React hook for MSAL authentication
 * @param config - MSAL configuration
 * @param onAuthSuccess - Optional callback invoked after successful authentication
 * @returns Authentication state and actions
 */
export const useAuthentication = (
  config: MsalAuthConfig,
  onAuthSuccess?: () => Promise<void>
): UseAuthenticationResult => {
  const [authState, setAuthState] = useState<AuthenticationState>({
    isInitializing: true,
    isAuthenticated: false,
    needsLogin: false,
    authError: null,
    jwtToken: null,
    isInIframe: IS_IN_IFRAME,
    sdkInitialized: false,
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('[MSAL Auth] Starting authentication initialization');

        setAuthState(prev => ({
          ...prev,
          isInitializing: true,
          authError: null,
          needsLogin: false,
        }));

        // Initialize MSAL
        await authService.initialize(config);

        // Check if user is already logged in
        if (authService.isLoggedIn()) {
          console.log('[MSAL Auth] User already logged in');
          try {
            const token = await authService.getAccessToken();
            setAuthState(prev => ({
              ...prev,
              jwtToken: token,
              isAuthenticated: true,
            }));

            // Call success callback if provided
            if (onAuthSuccess) {
              await onAuthSuccess();
            }
          } catch (tokenError) {
            console.warn('[MSAL Auth] Token acquisition failed:', tokenError);
            setAuthState(prev => ({
              ...prev,
              needsLogin: true,
            }));
          }
        } else {
          console.log('[MSAL Auth] User not logged in');
          setAuthState(prev => ({
            ...prev,
            needsLogin: true,
          }));
        }

        setAuthState(prev => ({
          ...prev,
          isInitializing: false,
        }));
        console.log('[MSAL Auth] Initialization completed');
      } catch (error) {
        console.error('[MSAL Auth] Initialization failed:', error);
        setAuthState(prev => ({
          ...prev,
          authError: error instanceof Error ? error.message : 'Initialization failed',
          needsLogin: true,
          isInitializing: false,
        }));
      }
    };

    initialize();
  }, [config, onAuthSuccess]);

  const handleLogin = async () => {
    try {
      setAuthState(prev => ({
        ...prev,
        isInitializing: true,
        authError: null,
      }));

      console.log('[MSAL Auth] Starting login process...');

      // For redirect flow, this will redirect the page
      // For popup flow, it will return the result
      const result = await authService.loginInteractive();

      // This will only execute for popup flow
      if (result) {
        console.log('[MSAL Auth] Login successful');

        setAuthState(prev => ({
          ...prev,
          jwtToken: result.accessToken,
          isAuthenticated: true,
          needsLogin: false,
        }));

        // Call success callback if provided
        if (onAuthSuccess) {
          await onAuthSuccess();
        }
      }
    } catch (error) {
      console.error('[MSAL Auth] Login failed:', error);

      let errorMessage = 'Login failed';

      if (error instanceof Error) {
        if (error.message.includes('interaction_in_progress')) {
          errorMessage = 'Authentication window was closed or interrupted. Please try again.';
          // Auto-clear for this specific error
          handleClearAuthState();
        } else if (error.message.includes('cancelled')) {
          errorMessage = 'Authentication was cancelled. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }

      setAuthState(prev => ({
        ...prev,
        authError: errorMessage,
      }));
    } finally {
      setAuthState(prev => ({
        ...prev,
        isInitializing: false,
      }));
    }
  };

  const handleClearAuthState = async () => {
    try {
      setAuthState(prev => ({
        ...prev,
        isInitializing: true,
        authError: null,
      }));

      await authService.clearAuthenticationState();

      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        needsLogin: true,
        jwtToken: null,
        authError: null,
      }));
    } catch (error) {
      console.error('[MSAL Auth] Clear auth state failed:', error);
    } finally {
      setAuthState(prev => ({
        ...prev,
        isInitializing: false,
      }));
    }
  };

  const handleLogout = async () => {
    try {
      console.log('[MSAL Auth] Starting logout process...');

      setAuthState(prev => ({
        ...prev,
        isInitializing: true,
        authError: null,
      }));

      await authService.logout();
      console.log('[MSAL Auth] Logout successful');

      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        needsLogin: true,
        jwtToken: null,
        authError: null,
        isInitializing: false,
      }));
    } catch (error) {
      console.error('[MSAL Auth] Logout failed:', error);
      setAuthState(prev => ({
        ...prev,
        authError: error instanceof Error ? error.message : 'Logout failed',
        isInitializing: false,
      }));
    }
  };

  const handleForceRefresh = async () => {
    window.location.reload();
  };

  const actions: AuthenticationActions = {
    handleLogin,
    handleLogout,
    handleForceRefresh,
    handleClearAuthState,
  };

  return {
    authState,
    actions,
    IS_IN_IFRAME,
  };
};
