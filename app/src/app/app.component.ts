import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, NavbarComponent],
  template: `
    <app-navbar />
    <router-outlet></router-outlet>
  `,
  styles: `
  @media print {
    app-navbar {
        display: none;
    }
}`,
})
export class AppComponent {}
