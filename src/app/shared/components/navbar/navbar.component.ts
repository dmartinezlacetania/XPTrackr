// Importem els components i mòduls necessaris
import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameSearchComponent } from '../game-search/game-search.component';
import { FormsModule } from '@angular/forms';

// Definim el component de la barra de navegació
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, GameSearchComponent, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  // Estats d'autenticació i informació de l'usuari
  isAuthenticated: boolean = false;
  username: string = '';
  userEmail: string = '';
  avatarUrl: string | null = null;
  
  // Estats dels menús desplegables
  isUserMenuOpen: boolean = false;
  isSearchOpen: boolean = false;
  searchTerm: string = '';
  
  // Subscripció per gestionar l'estat d'autenticació
  private subscription!: Subscription;

  // Referència al menú desplegable d'usuari
  @ViewChild('userMenuDropdown') userMenuDropdown!: ElementRef;

  constructor(private authService: AuthService) {}

  // Inicialitzem el component
  ngOnInit(): void {
    this.subscription = this.authService.authStatus$.subscribe(async (status) => {
      this.isAuthenticated = status;

      if (status) {
        const user = await this.authService.getUser();
        this.username = user?.name || 'Usuari';
        this.userEmail = user?.email || '';
        if (user && user.avatar) {
          this.avatarUrl = this.authService.getAvatarUrl(user.avatar);
        } else {
          this.avatarUrl = null;
        }
      } else {
        this.username = '';
        this.userEmail = '';
        this.avatarUrl = null;
      }
    });
  }

  // Netegem la subscripció quan es destrueix el component
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Mètode per alternar el menú d'usuari
  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    if (this.isUserMenuOpen && this.isSearchOpen) {
      this.isSearchOpen = false;
    }
  }

  // Detectem clics fora del menú d'usuari per tancar-lo
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.userMenuDropdown && !this.userMenuDropdown.nativeElement.contains(event.target)) {
      this.isUserMenuOpen = false;
    }
  }

  // Mètode per tancar la sessió
  async logout(): Promise<void> {
    await this.authService.logout();
    location.reload();
  }

  // Mètodes per gestionar la cerca
  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen && this.isUserMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }

  openSearchResults(): void {
    this.isSearchOpen = true;
    if (this.isUserMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }

  closeSearch(): void {
    this.isSearchOpen = false;
  }

  clearSearch(): void {
    this.searchTerm = '';
  }
}