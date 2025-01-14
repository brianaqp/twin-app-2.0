import { Injectable, signal } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private status = signal(true);
    
    constructor() {}

    isUserLoggedIn() {
        return this.status();
    }

    changeStatus(status: boolean) {
        this.status.set(status);
    }
}