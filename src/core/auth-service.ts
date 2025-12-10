/**
 * MSAL Authentication Service (Platform Agnostic)
 * Supports both popup and redirect authentication flows
 */

import {
  PublicClientApplication,
  Configuration,
  AccountInfo,
  AuthenticationResult,
  BrowserAuthError,
  InteractionRequiredAuthError,
  EndSessionRequest,
  RedirectRequest,
  PopupRequest,
  SilentRequest,
} from '@azure/msal-browser';
import { MsalAuthConfig, AuthFlowType, TokenResult, AuthServiceStatus } from './types';

export class MsalAuthService {
  private msalInstance: PublicClientApplication | null = null;
  private config: MsalAuthConfig | null = null;
  private isInitialized = false;
  private cachedToken: string | null = null;
  private tokenExpiryTime: number | null = null;
  private isLoginInProgress = false;
  private flowType: AuthFlowType = 'popup';
  private tokenRefreshInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Initialize the MSAL instance with configuration
   */
  async initialize(config: MsalAuthConfig): Promise<void> {
    if (this.isInitialized && this.config?.clientId === config.clientId) {
      console.log('[MSAL Auth] Already initialized');
      return;
    }

    this.config = config;
    this.flowType = config.flowType || 'popup';

    const authority = config.authority || `https://login.microsoftonline.com/${config.tenantId}`;

    const msalConfig: Configuration = {
      auth: {
        clientId: config.clientId,
        authority,
        redirectUri: config.redirectUri,
        postLogoutRedirectUri: config.postLogoutRedirectUri || config.redirectUri,
        navigateToLoginRequestUrl: config.navigateToLoginRequestUrl ?? false,
      },
      cache: {
        cacheLocation: config.cacheLocation || 'localStorage',
        storeAuthStateInCookie: false,
      },
      system: {
        allowNativeBroker: false,
        windowHashTimeout: 60000,
        iframeHashTimeout: 6000,
        loadFrameTimeout: 0,
        tokenRenewalOffsetSeconds: config.tokenRenewalOffsetSeconds || 300,
        loggerOptions: config.enableLogging ? {
          loggerCallback: (level, message) => {
            if (level <= 3) {
              console.log(`[MSAL ${level}]: ${message}`);
            }
          },
          piiLoggingEnabled: false,
          logLevel: 3,
        } : undefined,
      },
    };

    try {
      console.log('[MSAL Auth] Initializing with flow type:', this.flowType);
      this.msalInstance = new PublicClientApplication(msalConfig);
      await this.msalInstance.initialize();

      // Handle redirect promise for redirect flow
      if (this.flowType === 'redirect') {
        console.log('[MSAL Auth] Handling redirect response...');
        const redirectResponse = await this.msalInstance.handleRedirectPromise();
        if (redirectResponse) {
          console.log('[MSAL Auth] Redirect response received:', redirectResponse);
          this.setCachedToken(redirectResponse);
        }
      }

      await this.clearPendingInteractions();
      this.isInitialized = true;
      
      // Start automatic token refresh if user is logged in
      if (this.isLoggedIn()) {
        this.startTokenRefreshTimer();
      }
      
      console.log('[MSAL Auth] Initialization completed');
    } catch (error) {
      console.error('[MSAL Auth] Initialization failed:', error);
      this.isInitialized = true; // Prevent infinite loops
      throw error;
    }
  }

  /**
   * Clear any pending interactions
   */
  private async clearPendingInteractions(): Promise<void> {
    try {
      this.isLoginInProgress = false;
      const accounts = this.getAllAccounts();
      
      if (accounts.length > 0) {
        try {
          await this.acquireTokenSilent();
          console.log('[MSAL Auth] No stuck interactions detected');
        } catch (silentError) {
          if (silentError instanceof BrowserAuthError &&
            silentError.errorCode === 'interaction_in_progress') {
            console.warn('[MSAL Auth] Detected stuck interaction');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    } catch (error) {
      console.warn('[MSAL Auth] Error clearing pending interactions:', error);
    }
  }

  /**
   * Check if MSAL is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized || !this.msalInstance || !this.config) {
      throw new Error('MSAL not initialized. Call initialize() first.');
    }
  }

  /**
   * Get all accounts
   */
  getAllAccounts(): AccountInfo[] {
    this.ensureInitialized();
    return this.msalInstance!.getAllAccounts();
  }

  /**
   * Get the current account
   */
  getCurrentAccount(): AccountInfo | null {
    const accounts = this.getAllAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    const accounts = this.getAllAccounts();
    return accounts.length > 0;
  }

  /**
   * Acquire token silently
   */
  async acquireTokenSilent(): Promise<TokenResult> {
    this.ensureInitialized();

    // Check cached token first
    if (this.cachedToken && this.tokenExpiryTime && Date.now() < this.tokenExpiryTime) {
      console.log('[MSAL Auth] Using cached token');
      return {
        accessToken: this.cachedToken,
        expiresOn: new Date(this.tokenExpiryTime),
        account: this.getCurrentAccount(),
      };
    }

    const account = this.getCurrentAccount();
    if (!account) {
      throw new Error('NO_ACCOUNTS_FOUND');
    }

    const request: SilentRequest = {
      scopes: this.config!.scopes,
      account,
      forceRefresh: false,
    };

    try {
      console.log('[MSAL Auth] Attempting silent token acquisition...');
      const result = await this.msalInstance!.acquireTokenSilent(request);
      this.setCachedToken(result);
      console.log('[MSAL Auth] Silent token acquisition successful');
      return {
        accessToken: result.accessToken,
        expiresOn: result.expiresOn,
        account: result.account,
      };
    } catch (error) {
      console.warn('[MSAL Auth] Silent token acquisition failed:', error);

      if (error instanceof BrowserAuthError &&
        error.errorCode === 'interaction_in_progress') {
        await this.handleInteractionInProgress();
        throw new Error('INTERACTION_IN_PROGRESS_RESOLVED');
      }

      if (error instanceof InteractionRequiredAuthError) {
        throw new Error('INTERACTION_REQUIRED');
      }

      throw new Error('SILENT_REFRESH_FAILED');
    }
  }

  /**
   * Login interactively (popup or redirect)
   */
  async loginInteractive(): Promise<AuthenticationResult> {
    this.ensureInitialized();

    if (this.isLoginInProgress) {
      throw new Error('Login already in progress');
    }

    this.isLoginInProgress = true;

    const request = {
      scopes: this.config!.scopes,
      prompt: this.config!.prompt || 'select_account',
    };

    try {
      console.log(`[MSAL Auth] Starting ${this.flowType} login...`);

      let result: AuthenticationResult;

      if (this.flowType === 'redirect') {
        // For redirect, this will redirect the page
        await this.msalInstance!.acquireTokenRedirect(request as RedirectRequest);
        // The following code won't execute as the page redirects
        throw new Error('Redirect initiated');
      } else {
        // Popup flow
        result = await this.msalInstance!.acquireTokenPopup(request as PopupRequest);
        console.log('[MSAL Auth] Popup login successful');
        this.setCachedToken(result);
        this.startTokenRefreshTimer(); // Start automatic refresh
        return result;
      }
    } catch (error) {
      console.error('[MSAL Auth] Login failed:', error);

      if (error instanceof BrowserAuthError) {
        if (error.errorCode === 'interaction_in_progress') {
          await this.handleInteractionInProgress();
          throw new Error('Authentication window was closed or interrupted. Please try again.');
        } else if (error.errorCode === 'user_cancelled' ||
          error.errorCode === 'popup_window_error') {
          throw new Error('Authentication was cancelled. Please try again.');
        }
      }

      throw error;
    } finally {
      this.isLoginInProgress = false;
    }
  }

  /**
   * Get access token (with automatic refresh)
   */
  async getAccessToken(): Promise<string> {
    try {
      const tokenResult = await this.acquireTokenSilent();
      return tokenResult.accessToken;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'NO_ACCOUNTS_FOUND' ||
          error.message === 'INTERACTION_REQUIRED' ||
          error.message === 'SILENT_REFRESH_FAILED') {
          console.log('[MSAL Auth] Attempting interactive login...');
          const result = await this.loginInteractive();
          return result.accessToken;
        }

        if (error.message === 'INTERACTION_IN_PROGRESS_RESOLVED') {
          console.log('[MSAL Auth] Retrying after clearing interaction...');
          return await this.getAccessToken();
        }
      }

      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    this.ensureInitialized();

    this.stopTokenRefreshTimer(); // Stop automatic refresh

    const account = this.getCurrentAccount();
    if (account) {
      const logoutRequest: EndSessionRequest = {
        account,
      };

      if (this.flowType === 'redirect') {
        await this.msalInstance!.logoutRedirect(logoutRequest);
      } else {
        await this.msalInstance!.logoutPopup(logoutRequest);
      }

      this.clearCachedToken();
    }

    this.isLoginInProgress = false;
  }

  /**
   * Clear authentication state
   */
  async clearAuthenticationState(): Promise<void> {
    console.log('[MSAL Auth] Clearing authentication state...');

    this.stopTokenRefreshTimer(); // Stop automatic refresh
    this.isLoginInProgress = false;
    this.clearCachedToken();

    // Clear browser storage
    try {
      const storageKeys = [...Object.keys(sessionStorage), ...Object.keys(localStorage)];
      storageKeys.forEach(key => {
        if (key.includes('msal') || key.includes('microsoft') || key.includes('login')) {
          sessionStorage.removeItem(key);
          localStorage.removeItem(key);
        }
      });
      console.log('[MSAL Auth] Browser storage cleared');
    } catch (error) {
      console.warn('[MSAL Auth] Error clearing browser storage:', error);
    }

    this.isInitialized = false;
    console.log('[MSAL Auth] Authentication state cleared');
  }

  /**
   * Handle interaction in progress error
   */
  private async handleInteractionInProgress(): Promise<void> {
    console.log('[MSAL Auth] Handling interaction in progress...');
    this.isLoginInProgress = false;
    this.clearCachedToken();
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  /**
   * Cache token with expiry
   */
  private setCachedToken(result: AuthenticationResult): void {
    this.cachedToken = result.accessToken;
    // Set expiry 5 minutes before actual expiry for safety
    this.tokenExpiryTime = (result.expiresOn?.getTime() || Date.now()) - (5 * 60 * 1000);
    console.log('[MSAL Auth] Token cached successfully');
  }

  /**
   * Clear cached token
   */
  private clearCachedToken(): void {
    this.cachedToken = null;
    this.tokenExpiryTime = null;
  }

  /**
   * Force refresh token
   */
  async forceRefreshToken(): Promise<string> {
    this.clearCachedToken();
    return await this.getAccessToken();
  }

  /**
   * Start automatic token refresh timer
   * Refreshes token every 30 minutes to keep user logged in
   */
  private startTokenRefreshTimer(): void {
    // Clear any existing timer
    this.stopTokenRefreshTimer();

    // Refresh token every 30 minutes (1800000 ms)
    // Token is cached for 55 minutes, so this ensures fresh tokens
    const refreshInterval = 30 * 60 * 1000; // 30 minutes

    this.tokenRefreshInterval = setInterval(async () => {
      try {
        if (this.isLoggedIn()) {
          console.log('[MSAL Auth] Background token refresh...');
          await this.acquireTokenSilent();
          console.log('[MSAL Auth] Background token refresh successful');
        } else {
          console.log('[MSAL Auth] User not logged in, stopping refresh timer');
          this.stopTokenRefreshTimer();
        }
      } catch (error) {
        console.warn('[MSAL Auth] Background token refresh failed:', error);
        // Don't stop the timer - keep trying
      }
    }, refreshInterval);

    console.log('[MSAL Auth] Token refresh timer started (30 min intervals)');
  }

  /**
   * Stop automatic token refresh timer
   */
  private stopTokenRefreshTimer(): void {
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
      this.tokenRefreshInterval = null;
      console.log('[MSAL Auth] Token refresh timer stopped');
    }
  }

  /**
   * Get service status (for debugging)
   */
  getStatus(): AuthServiceStatus {
    return {
      isInitialized: this.isInitialized,
      hasToken: !!this.cachedToken,
      tokenExpiry: this.tokenExpiryTime,
      isLoginInProgress: this.isLoginInProgress,
      accountCount: this.getAllAccounts().length,
      flowType: this.flowType,
    };
  }
}

// Export singleton instance
export const authService = new MsalAuthService();
