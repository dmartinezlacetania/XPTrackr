import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service'; // Asegúrate de que tienes un servicio de autenticación
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  isAuthenticated: boolean = false;
  username: string = '';
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
      } else {
        this.username = '';
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
    // authStatus$ se actualiza automáticamente
  }
}