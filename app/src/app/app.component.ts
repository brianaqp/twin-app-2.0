import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService, LoginStatus } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { LoginComponent } from './sections/login/login.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterModule, NavbarComponent, LoginComponent],
  template: `
    @switch (authService.loginStatus()) {
      @case (LoginStatus.TRUE) {
        <app-navbar />
        <router-outlet />
      }
      @case (LoginStatus.FALSE) {
        <app-login />
      }
      @case (LoginStatus.INIT) {
        <div class="d-flex justify-content-center align-items-center vh-100">
          <div class="text-center">
            <div
              class="spinner-border text-primary"
              role="status"
              style="width: 3rem; height: 3rem;"
            >
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Please wait...</p>
          </div>
        </div>
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
export class AppComponent implements OnInit {
  authService = inject(AuthService);

  // Enum
  LoginStatus = LoginStatus;

  ngOnInit(): void {}
}
