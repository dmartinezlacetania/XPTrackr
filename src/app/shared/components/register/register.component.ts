import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import axios from 'axios';
import { CommonModule } from '@angular/common';

axios.defaults.withCredentials = true;

function passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
  const password = group.get('password');
  const confirmPassword = group.get('password_confirmation');
  return password && confirmPassword && password.value === confirmPassword.value ? null : { 'passwordMismatch': true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registroForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
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

  passwordMatchValidator(group: AbstractControl) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('password_confirmation')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

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