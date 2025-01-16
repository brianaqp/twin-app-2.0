import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  User,
} from 'firebase/auth';

export enum LoginStatus {
  INIT,
  TRUE,
  FALSE,
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // --- Auth variables
  private readonly status = signal(LoginStatus.INIT);
  authToken: null | string = null;
  // Setter for the signal
  set userAuthStatus(status: LoginStatus) {
    this.status.set(status);
  }

  // Readonly version for other components
  public loginStatus = this.status.asReadonly();

  // Dependencies
  private http = inject(HttpClient);

  // Firebase
  private firebaseApp = initializeApp({
    apiKey: 'AIzaSyA6Y44g84TqfI7i17U4tcDSjOS9rgtJiF4',
    authDomain: 'twin-47464.firebaseapp.com',
    projectId: 'twin-47464',
    storageBucket: 'twin-47464.firebasestorage.app',
    messagingSenderId: '883986157924',
    appId: '1:883986157924:web:a8d142792e6b68028e2a71',
    measurementId: 'G-5HMN9EPHW7',
  });
  private auth = getAuth(this.firebaseApp);

  constructor() {
    console.log('AUTH SERVICE INITIALIZED');
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userAuthStatus = LoginStatus.TRUE;
        user
          .getIdToken()
          .then((value) => {
            this.authToken = value;
          })
          .catch((error) => {
            console.error('Something happend with Firebase Token.', error);
          });
      } else {
        this.userAuthStatus = LoginStatus.FALSE;
        this.authToken = null;
      }
    });
  }

  // Functions
  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    this.auth.signOut();
  }
}
