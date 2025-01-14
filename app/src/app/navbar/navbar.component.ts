import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, NgbCollapseModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isNavCollapsed = true; // Variable para controlar el estado del menu colapsable de navegación
  sideMenuAllowed = false;
  subscription!: Subscription;

  // Services
  private navbarService = inject(NavbarService);
  private authService = inject(AuthService);

  ngOnInit() {
    // Subscripción al observable que contiene la información si el usuario está en la sección de operaciones
    this.subscription = this.navbarService.sideMenu$.subscribe((state) => {
      this.sideMenuAllowed = state;
    });
    // Añade un listener al evento resize de la ventana
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  onWindowResize() {
    // Método para cerrar el menú lateral cuando se cambia el tamaño de la pantalla
    if (window.innerWidth >= 992) {
      if (!this.isNavCollapsed) {
        this.toggleNavCollapse();
      }
      if (this.sideMenuAllowed) {
        if (!this.navbarService.sideMenuCollapsedState) {
          this.navbarService.triggerResizeEvent();
        }
      }
    }
  }

  toggleNavCollapse() {
    // Método para abrir y cerrar el menu colapsable
    if (!this.isNavCollapsed) {
      this.isNavCollapsed = true;
    }
  }

  toggleSideMenu() {
    // Método para abrir y cerrar el menú lateral
    this.navbarService.toggleSMCollapseState();
  }

  logout() {
    // Método para cerrar la sesión del usuario
    this.authService.logout();
  }

  ngOnDestroy() {
    // Destruye la subscripción al observable
    this.subscription.unsubscribe();
    // Elimina el listener del evento resize
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }
}
