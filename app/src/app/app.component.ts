import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterModule],
  template: `
    <router-outlet />
    `,
  styles: `
  @media print {
    app-navbar {
        display: none;
    }
}`,
})
export class AppComponent {
}
