/**
 * Angular Route Guard for MSAL Authentication
 * Protects routes and ensures user is authenticated
 */

import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { MsalAuthService } from './msal-auth.service';

@Injectable({
  providedIn: 'root'
})
export class MsalAuthGuard  {
  constructor(
    private authService: MsalAuthService,
    private router: Router
  ) {}

  canActivate(
    _route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth(state.url);
  }

  canActivateChild(
    _childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth(state.url);
  }

  private async checkAuth(url: string): Promise<boolean | UrlTree> {
    const authState = this.authService.getCurrentState();

    // If authenticated, allow access
    if (authState.isAuthenticated) {
      return true;
    }

    // If not authenticated, try to login
    if (authState.needsLogin) {
      try {
        await this.authService.login();
        return true;
      } catch (error) {
        console.error('Authentication failed:', error);
        // Redirect to login page or return false
        return this.router.createUrlTree(['/login'], {
          queryParams: { returnUrl: url }
        });
      }
    }

    // Still initializing
    return false;
  }
}
