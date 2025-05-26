// Importem els components i mòduls necessaris
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';

// Definim el component d'inici de sessió
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  // Formulari d'inici de sessió i estats
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    // Inicialitzem el formulari amb validacions
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  // Mètode per gestionar l'enviament del formulari
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Si us plau, completa tots els camps.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.login(this.loginForm.value);
      this.loading = false;
      console.log('Inicio de sessio amb exit');
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.loading = false;
      let message = 'Credenciales incorrectes.';
      if (error?.response?.data?.message) {
        message = error.response.data.message;
      }
      this.errorMessage = message;
    }
  }
}
