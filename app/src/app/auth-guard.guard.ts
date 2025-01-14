import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

export const authGuardFunction: CanActivateFn = (
  next,
  state
) => {
      let userStatus = inject(AuthService).userAuthStatus;
      const router = inject(Router);

      if (!userStatus) {
        router.navigate(["/login"]);
        return false;
      } else {
        return true;
      }
}