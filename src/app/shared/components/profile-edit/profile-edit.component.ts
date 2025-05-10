import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.css'
})
export class ProfileEditComponent implements OnInit {
  editForm: FormGroup;
  loading = false;
  errorMessage = '';
  user: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      current_password: ['', Validators.required],
      new_password: [''],
      new_password_confirmation: ['']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.loadUserData();
  }

  async loadUserData() {
    try {
      const user = await this.authService.getUser();
      if (user) {
        this.user = user;
        this.editForm.patchValue({
          name: user.name,
          email: user.email
        });
      } else {
        this.router.navigate(['/login']);
      }
    } catch (error) {
      this.router.navigate(['/login']);
    }
  }

  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('new_password')?.value;
    const confirmPassword = group.get('new_password_confirmation')?.value;
    
    if (!newPassword && !confirmPassword) {
      return null;
    }
    
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  async onSubmit() {
    if (this.editForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      const payload = { ...this.editForm.value }; // Crear una copia de los valores del formulario

      // Si new_password no se proporciona (está vacío),
      // eliminamos los campos de contraseña nueva del payload
      // para que el backend no intente actualizar la contraseña.
      if (!payload.new_password) {
        delete payload.new_password;
        delete payload.new_password_confirmation;
      }
      // Si new_password se proporciona, new_password_confirmation también se envía
      // y ya ha sido validado por passwordMatchValidator para asegurar que coinciden.

      try {
        // Enviar el payload modificado al servicio
        await this.authService.updateProfile(payload);
        this.router.navigate(['/profile']);
      } catch (error: any) {
        this.errorMessage = error?.response?.data?.message || 'Error al actualizar el perfil.';
      } finally {
        this.loading = false;
      }
    } else {
      // Marcar todos los campos como tocados para mostrar errores de validación si es necesario
      this.editForm.markAllAsTouched();
    }
  }
}
