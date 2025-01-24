import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { AuthStatus } from '../interfaces/auth';

@Injectable({
  providedIn: 'root',
})

/**
 * Service who manage the auth state and works as a layer of communication between the app
 * and firebase.
 */
export class AuthService {
  // --- Auth variables
  private readonly _authStatus = signal(AuthStatus.NULL);
  private _currentAuthToken: null | string = null;

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
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this._authStatus.set(AuthStatus.ALLOWED);
        user
          .getIdToken()
          .then((value) => {
            this._currentAuthToken = value;
          })
          .catch((error) => {
            console.error('Something happend with Firebase Token.', error);
          });
      } else {
        this._authStatus.set(AuthStatus.NOT_ALLOWED);
        this._currentAuthToken = null;
      }
    });
  }

  // Public getters
  public get authStatus() {
    return this._authStatus.asReadonly();
  }

  public get authToken() {
    return this._currentAuthToken;
  }

  // Functions
  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    this.auth.signOut();
  }
}
