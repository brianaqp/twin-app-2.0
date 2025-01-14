import { HttpClient } from "@angular/common/http";
import { effect, inject, Injectable, OnInit, signal } from "@angular/core";
import { environment } from "../environments/environment"

@Injectable({
    providedIn: 'root'
})
export class AuthService implements OnInit {
    private readonly status = signal(false);

    // Dependencies
    private http = inject(HttpClient);
    
    constructor() {
        // Logger effect
        effect(() => {
            console.log('status changed to', this.status());
        });
    }

    get userAuthStatus()  {
        return this.status();
    }

    set userAuthStatus(status: boolean) {
        this.status.set(status);
    }

    ngOnInit(): void {
        // [ ] Check if is sign in
    }

    // [ ] Implement login and logout methods
    login(email: string, password: string) {
        this.http.post(`${environment.apiUrl}/login`, { email, password }).subscribe({
            next: (response) => {
                console.log(response);
                this.userAuthStatus = true;
            },
            error: (error) => {
                console.error(error);
                this.userAuthStatus = false;
            }
        });
    }

    logout() {
        this.userAuthStatus = false;
    }
}