import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavbarService {
  // Subject / isInOpt
  private sideMenu = new BehaviorSubject<boolean>(false);
  sideMenu$ = this.sideMenu.asObservable();
  // Subject / SideMenu
  private sideMenuCollapsed = new BehaviorSubject<boolean>(true);
  sideMenuCollapsed$ = this.sideMenuCollapsed.asObservable();
  // señal
  private resizeEvent = new Subject<void>();
  resizeEvent$ = this.resizeEvent.asObservable();

  get sideMenuCollapsedState(): boolean {
    return this.sideMenuCollapsed.value;
  }

  // Operaciones
  setSideMenuState(value: boolean): void {
    this.sideMenu.next(value);
  }

  // SideMenu
  toggleSMCollapseState(): void {
    this.sideMenuCollapsed.next(!this.sideMenuCollapsed.value);
  }

  // señal
  triggerResizeEvent(): void {
    this.resizeEvent.next();
  }
}
