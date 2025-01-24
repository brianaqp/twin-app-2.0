import { Component, inject, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule],
  template: `
    <div class="d-flex justify-content-center align-items-center vh-100">
      <div
        class="login card p-4 shadow-sm"
        style="width: 350px; border-radius: 8px;"
      >
        <h1 class="text-center mb-4">Login</h1>
        <div class="form-group mb-3">
          <label for="email" class="form-label">Email</label>
          <input
            class="form-control"
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            [formControl]="email"
          />
        </div>
        <div class="form-group mb-4">
          <label for="password" class="form-label">Password</label>
          <input
            class="form-control"
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            [formControl]="password"
          />
        </div>
        <button type="button" class="btn btn-primary w-100" (click)="onLogin()">
          Login
        </button>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnDestroy {
  auth$ = inject(AuthService);
  router = inject(Router);

  // Form controls
  email = new FormControl('brianqp9889@gmail.com', { nonNullable: true });
  password = new FormControl('admin123', { nonNullable: true });

  emailChange(event: any) {
    this.email = event.target.value;
  }

  onLogin() {
    this.auth$.login(this.email.value, this.password.value).catch((error) => {
      console.error('Error in onLoginc()', error);
    });
  }

  ngOnDestroy(): void {
    console.log('Login comp destroyed');
  }
}
