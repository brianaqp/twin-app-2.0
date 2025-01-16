import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-auth',
  imports: [RouterModule],
  template: `
    <h1>Not Authorized</h1>
    <span>Sorry, you are not authorized to view this page.</span>
    <a routerLink="/login">Click here to go back to the login page</a>
  `,
})
export class NotAuthComponent {}
