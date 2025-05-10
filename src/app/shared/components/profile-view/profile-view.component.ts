import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-view',
  imports: [CommonModule],
  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.css'
})
export class ProfileViewComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  user: any = null;
  loading: boolean = true;
  avatarUrl: string = '/images/default-avatar.png';  // Correcto
  private authSubscription!: Subscription;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.authStatus$.subscribe(async isAuth => {
      this.loading = true;

      if (isAuth) {
        try {
          const user = await this.authService.getUser();
          if (user) {
            this.user = user;
            if (this.user.avatar) {
              this.avatarUrl = this.authService.getAvatarUrl(this.user.avatar);
            }
          } else {
            this.router.navigate(['/login']);
          }
        } catch {
          this.router.navigate(['/login']);
        }
      } else {
        this.router.navigate(['/login']);
      }

      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  // async onFileSelected(event: any) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const formData = new FormData();
  //     formData.append('avatar', file);

  //     try {
  //       const response = await this.authService.updateAvatar(formData);
  //       if (response.data.avatar) {
  //         this.avatarUrl = this.authService.getAvatarUrl(response.data.avatar);
  //         this.user.avatar = response.data.avatar;
  //       }
  //     } catch (error: any) {
  //       this.errorMessage = error?.response?.data?.message || 'Error al subir el avatar';
  //       setTimeout(() => this.errorMessage = '', 3000);
  //     }
  //   }
  // }

<<<<<<< HEAD

=======
  onImageError() {
    this.avatarUrl = '/images/default-avatar.png';
  }
>>>>>>> c97cefb7cbba9054ffe2602e699819683202ed10
}
