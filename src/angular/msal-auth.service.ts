/**
 * Angular MSAL Authentication Service
 * Injectable service for Angular applications
 */

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { authService } from '../core/auth-service';
import { MsalAuthConfig, AuthenticationState } from '../core/types';

@Injectable({
  providedIn: 'root'
})
export class MsalAuthService {
  private authStateSubject = new BehaviorSubject<AuthenticationState>({
    isInitializing: true,
    isAuthenticated: false,
    needsLogin: false,
    authError: null,
    jwtToken: null,
    isInIframe: this.checkIframeContext(),
    sdkInitialized: false,
  });

  public authState$ = this.authStateSubject.asObservable();

  /**
   * Check if running in iframe context
   */
  private checkIframeContext(): boolean {
    try {
      return window.self !== window.top;
    } catch (error) {
      return true;
    }
  }

  /**
   * Initialize MSAL with configuration
   */
  async initialize(config: MsalAuthConfig): Promise<void> {
    try {
      this.updateState({ isInitializing: true, authError: null });

      await authService.initialize(config);

      if (authService.isLoggedIn()) {
        try {
          const token = await authService.getAccessToken();
          this.updateState({
            jwtToken: token,
            isAuthenticated: true,
            isInitializing: false,
          });
        } catch (error) {
          this.updateState({
            needsLogin: true,
            isInitializing: false,
          });
        }
      } else {
        this.updateState({
          needsLogin: true,
          isInitializing: false,
        });
      }
    } catch (error) {
      this.updateState({
        authError: error instanceof Error ? error.message : 'Initialization failed',
        needsLogin: true,
        isInitializing: false,
      });
    }
  }

  /**
   * Login interactively
   */
  async login(): Promise<void> {
    try {
      this.updateState({ isInitializing: true, authError: null });

      const result = await authService.loginInteractive();

      if (result) {
        this.updateState({
          jwtToken: result.accessToken,
          isAuthenticated: true,
          needsLogin: false,
          isInitializing: false,
        });
      }
    } catch (error) {
      let errorMessage = 'Login failed';
      
      if (error instanceof Error) {
        if (error.message.includes('cancelled')) {
          errorMessage = 'Authentication was cancelled. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }

      this.updateState({
        authError: errorMessage,
        isInitializing: false,
      });

      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      this.updateState({ isInitializing: true, authError: null });

      await authService.logout();

      this.updateState({
        isAuthenticated: false,
        needsLogin: true,
        jwtToken: null,
        authError: null,
        isInitializing: false,
      });
    } catch (error) {
      this.updateState({
        authError: error instanceof Error ? error.message : 'Logout failed',
        isInitializing: false,
      });
      throw error;
    }
  }

  /**
   * Get access token (returns Observable)
   */
  getAccessToken(): Observable<string> {
    return from(authService.getAccessToken());
  }

  /**
   * Get access token (returns Promise)
   */
  getAccessTokenAsync(): Promise<string> {
    return authService.getAccessToken();
  }

  /**
   * Force refresh token
   */
  async forceRefreshToken(): Promise<string> {
    return authService.forceRefreshToken();
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return authService.isLoggedIn();
  }

  /**
   * Get current auth state
   */
  getCurrentState(): AuthenticationState {
    return this.authStateSubject.value;
  }

  /**
   * Clear authentication state (error recovery)
   */
  async clearAuthenticationState(): Promise<void> {
    await authService.clearAuthenticationState();
    
    this.updateState({
      isAuthenticated: false,
      needsLogin: true,
      jwtToken: null,
      authError: null,
      isInitializing: false,
    });
  }

  /**
   * Update auth state
   */
  private updateState(partialState: Partial<AuthenticationState>): void {
    this.authStateSubject.next({
      ...this.authStateSubject.value,
      ...partialState,
    });
  }
}
