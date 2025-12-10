/**
 * Angular Module for MSAL Authentication
 * Import this module in your app.module.ts
 */

import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MsalAuthService } from './msal-auth.service';
import { MsalAuthGuard } from './msal-auth.guard';
import { MsalAuthInterceptor } from './msal-auth.interceptor';
import { MsalAuthConfig } from '../core/types';

/**
 * Configuration token for MSAL
 */
export const MSAL_CONFIG = 'MSAL_CONFIG';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [
    MsalAuthService,
    MsalAuthGuard,
  ]
})
export class MsalAuthModule {
  /**
   * Call this method in your root module to configure MSAL
   * @param config MSAL configuration
   */
  static forRoot(config: MsalAuthConfig): ModuleWithProviders<MsalAuthModule> {
    return {
      ngModule: MsalAuthModule,
      providers: [
        {
          provide: MSAL_CONFIG,
          useValue: config
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: MsalAuthInterceptor,
          multi: true
        }
      ]
    };
  }
}
