import {
  Component,
  inject,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { LoginComponent } from './sections/login/login.component';
import { SpinnerComponent } from './widgets/spinner.component';
import { AuthStatus } from './interfaces/auth';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterModule, NavbarComponent, LoginComponent, SpinnerComponent],
  template: `
  <!-- React to the auth state -->
    @switch (authStatus()) {
      @case (AuthStatus.ALLOWED) {
        <app-navbar />
        <router-outlet />
      }
      @case (AuthStatus.NOT_ALLOWED) {
        <app-login />
      }
      @case (AuthStatus.NULL) {
       <app-spinner />
      }
    }
  `,
  styles: `
    @media print {
      app-navbar {
        display: none;
      }
    }
  `,
})
export class AppComponent {
  // Auth Status
  authStatus = inject(AuthService).authStatus;

  // Enum
  AuthStatus = AuthStatus;
}
