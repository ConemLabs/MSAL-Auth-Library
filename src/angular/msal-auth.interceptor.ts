/**
 * Angular HTTP Interceptor for MSAL Authentication
 * Automatically adds bearer token to HTTP requests
 */

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { MsalAuthService } from './msal-auth.service';

@Injectable()
export class MsalAuthInterceptor implements HttpInterceptor {
  constructor(private authService: MsalAuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip authentication for certain URLs (e.g., login endpoints)
    if (this.shouldSkipAuth(request.url)) {
      return next.handle(request);
    }

    // Get token and add to request
    return from(this.authService.getAccessTokenAsync()).pipe(
      switchMap((token: string) => {
        const clonedRequest = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next.handle(clonedRequest);
      }),
      catchError((error: HttpErrorResponse) => {
        // Handle 401 errors - token might be expired
        if (error.status === 401) {
          console.warn('Unauthorized request - token may be expired');
          // Optionally trigger re-authentication
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Determine if request should skip authentication
   */
  private shouldSkipAuth(url: string): boolean {
    const skipUrls = [
      'login.microsoftonline.com',
      'graph.microsoft.com',
    ];
    
    return skipUrls.some(skipUrl => url.includes(skipUrl));
  }
}
