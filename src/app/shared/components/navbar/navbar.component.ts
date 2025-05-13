import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service'; // Asegúrate de que tienes un servicio de autenticación
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameSearchComponent } from '../game-search/game-search.component';



@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive, GameSearchComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  isAuthenticated: boolean = false;
  username: string = '';
  avatarUrl: string | null = null; // Nueva propiedad para la URL del avatar
  isUserMenuOpen: boolean = false;
  private subscription!: Subscription;

  @ViewChild('userMenuDropdown') userMenuDropdown!: ElementRef;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.subscription = this.authService.authStatus$.subscribe(async (status) => {
      this.isAuthenticated = status;

      if (status) {
        const user = await this.authService.getUser();
        this.username = user?.name || 'Usuario';
        if (user && user.avatar) {
          this.avatarUrl = this.authService.getAvatarUrl(user.avatar);
        } else {
          this.avatarUrl = null; // No hay avatar o no se pudo cargar
        }
      } else {
        this.username = '';
        this.avatarUrl = null; // Limpiar avatarUrl al cerrar sesión
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.userMenuDropdown && !this.userMenuDropdown.nativeElement.contains(event.target)) {
      this.isUserMenuOpen = false;
    }
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    // Actualizar la pagina
    location.reload();
    
    // authStatus$ se actualiza automáticamente, y el suscriptor en ngOnInit limpiará username y avatarUrl
  }

  isSearchOpen = false;

  toggleSearch() {
    console.log('Toggle Search clicked, current state:', this.isSearchOpen);
    this.isSearchOpen = !this.isSearchOpen;
    console.log('New state:', this.isSearchOpen);
    // Si abrimos la búsqueda, cerramos el menú de usuario si está abierto
    if (this.isSearchOpen && this.isUserMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }

  closeSearch() {
    this.isSearchOpen = false;
  }
}