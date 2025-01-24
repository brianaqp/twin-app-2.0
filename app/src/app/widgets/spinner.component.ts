import { Component } from '@angular/core';

@Component({
  selector: 'app-spinner',
  template: ` <div
    class="d-flex justify-content-center align-items-center vh-100"
  >
    <div class="text-center">
      <div
        class="spinner-border text-primary"
        role="status"
        style="width: 3rem; height: 3rem;"
      >
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Please wait...</p>
    </div>
  </div>`,
})
export class SpinnerComponent {}
