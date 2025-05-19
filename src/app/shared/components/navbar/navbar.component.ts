import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameSearchComponent } from '../game-search/game-search.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, GameSearchComponent, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  isAuthenticated: boolean = false;
  username: string = '';
  userEmail: string = '';
  avatarUrl: string | null = null;
  isUserMenuOpen: boolean = false;
  isSearchOpen: boolean = false;
  searchTerm: string = ''; // Para el input de búsqueda
  private subscription!: Subscription;

  @ViewChild('userMenuDropdown') userMenuDropdown!: ElementRef;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.subscription = this.authService.authStatus$.subscribe(async (status) => {
      this.isAuthenticated = status;

      if (status) {
        const user = await this.authService.getUser();
        this.username = user?.name || 'Usuario';
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    // Si abrimos el menú de usuario, cerramos la búsqueda si está abierta
    if (this.isUserMenuOpen && this.isSearchOpen) {
      this.isSearchOpen = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.userMenuDropdown && !this.userMenuDropdown.nativeElement.contains(event.target)) {
      this.isUserMenuOpen = false;
    }
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    location.reload();
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    // Si abrimos la búsqueda, cerramos el menú de usuario si está abierto
    if (this.isSearchOpen && this.isUserMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }

  openSearchResults(): void {
    this.isSearchOpen = true;
    // Si abrimos la búsqueda, cerramos el menú de usuario si está abierto
    if (this.isUserMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }

  closeSearch(): void {
    this.isSearchOpen = false;
  }

  clearSearch(): void {
    this.searchTerm = '';
    // Mantenemos el panel de búsqueda abierto pero con resultados vacíos
  }

  onSearchInput(): void {
    // Si el usuario escribe algo, aseguramos que el panel de resultados esté abierto
    if (!this.isSearchOpen) {
      this.openSearchResults();
    }
  }
}