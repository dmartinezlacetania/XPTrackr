// Importem els components i mòduls necessaris
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import axios from 'axios';
import { CommonModule } from '@angular/common';

// Configurem axios per acceptar cookies
axios.defaults.withCredentials = true;

// Funció per validar que les contrasenyes coincideixen
function passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
  const password = group.get('password');
  const confirmPassword = group.get('password_confirmation');
  return password && confirmPassword && password.value === confirmPassword.value ? null : { 'passwordMismatch': true };
}

// Definim el component de registre
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  // Formulari de registre i estats
  registroForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Inicialitzem el formulari amb validacions
    this.registroForm = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        password_confirmation: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  // Validador personalitzat per comprovar que les contrasenyes coincideixen
  passwordMatchValidator(group: AbstractControl) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('password_confirmation')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // Mètode per gestionar l'enviament del formulari
  async onSubmit() {
    if (this.registroForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      try {
        await this.authService.register(this.registroForm.value);
        this.router.navigate(['/dashboard']);
      } catch (error: any) {
        this.errorMessage = error?.response?.data?.message || 'Error al registrarse.';
      } finally {
        this.loading = false;
      }
    } else {
      this.registroForm.markAllAsTouched();
    }
  }
}