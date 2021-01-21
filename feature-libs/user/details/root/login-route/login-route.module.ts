import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PageLayoutComponent, PageLayoutModule } from '@spartacus/storefront';
import { LoginGuard } from './login.guard';

// to avoid ts compile warnings
export const loginRouteData = { cxRoute: 'login' };

/**
 * This module enables to quickly switch from Resource Owner Password Flow
 * to Implicit Flow or Authorization Code Flow. The `login` route in this case will be
 * responsible for initializing the redirect to OAuth server to login.
 *
 * Instead of manually invoking OAuth redirect you only have to redirect to `login` page.
 */
@NgModule({
  imports: [
    PageLayoutModule,
    RouterModule.forChild([
      {
        path: null,
        canActivate: [LoginGuard],
        component: PageLayoutComponent,
        data: loginRouteData,
      },
    ]),
  ],
})
export class LoginRouteModule {}