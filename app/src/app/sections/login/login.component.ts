import { Component, inject } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";

@Component({
    selector: "app-login",
    imports: [ReactiveFormsModule],
    template: `
        <div class="login">
            <h1>Login</h1>
            <div>
                <div class="form-group">
                    <label for="email" class="form-label"></label>
                    <input  class="form-control" type="email" id="email" name="email" [formControl]="email" />
                    <label for="password" class="form-label"></label>
                    <input  class="form-control" type="password" id="password" name="password" [formControl]="password" />
                </div>
                <button type="button" (click)="onLogin();">Login</button>
            </div>
        </div>
    `,
})
export class LoginComponent {   
    auth$ = inject(AuthService);
    router = inject(Router);

    // Form controls
    email = new FormControl('', { nonNullable: true});
    password = new FormControl('', { nonNullable: true });

    emailChange(event: any) {
        this.email = event.target.value;
    }
    
    onLogin() {
        this.auth$.login(this.email.value, this.password.value);
        this.router.navigate
    }
}