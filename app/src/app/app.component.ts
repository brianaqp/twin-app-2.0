import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterModule, NavbarComponent],
  template: `
    @if (authService.isUserLoggedIn()) {
      <h1>Logged in</h1>
      <app-navbar />
      <router-outlet></router-outlet>
    } @else {
      <h1>Not logged in</h1>
    }`,
  styles: `
  @media print {
    app-navbar {
        display: none;
    }
}`,
})
export class AppComponent {
  authService = inject(AuthService);
}
