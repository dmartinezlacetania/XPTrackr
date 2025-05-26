// Importem els components i mòduls necessaris
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NextGamesComponent } from '../next-games/next-games.component';

// Definim el component del tauler principal
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, NextGamesComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Informació de l'usuari i estats
  user: any = null;
  loading: boolean = true;
  errorMessage: string = '';
  private authSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Inicialitzem el component
  ngOnInit(): void {
    this.authSubscription = this.authService.authStatus$.subscribe(async (isAuthenticated) => {
      this.loading = true;

      if (isAuthenticated) {
        try {
          const user = await this.authService.getUser();
          if (user) {
            this.user = user;
          }
        } catch {
          this.user = null;
        }
      } else {
        this.user = null;
      }

      this.loading = false;
    });
  }

  // Netegem la subscripció quan es destrueix el component
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}