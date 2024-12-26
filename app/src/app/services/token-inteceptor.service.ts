import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
} from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Clone the request and replace the original headers with
    // cloned headers, updated with the passkey.
    const passkeyReq = req.clone({
      headers: req.headers.set('Passkey', environment.passkey),
    });

    // send cloned request with header to the next handler.
    return next.handle(passkeyReq);
  }
}
