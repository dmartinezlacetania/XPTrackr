import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NextWeekGamesComponent } from '../next-week-games/next-week-games.component';



@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, NextWeekGamesComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {

  user: any = null;
  loading: boolean = true;
  errorMessage: string = '';
  private authSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

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

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

}