import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
  
  // Requisitos de contraseña para mostrar al usuario
  passwordRequirements = [
    { id: 'minLength', text: 'Al menos 8 caracteres', valid: false },
    { id: 'hasUppercase', text: 'Al menos una letra mayúscula', valid: false },
    { id: 'hasLowercase', text: 'Al menos una letra minúscula', valid: false },
    { id: 'hasNumber', text: 'Al menos un número', valid: false },
    { id: 'hasSpecial', text: 'Al menos un carácter especial', valid: false }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      current_password: ['', Validators.required],
      new_password: ['', [this.passwordStrengthValidator]],
      new_password_confirmation: ['']
    }, { validators: this.passwordMatchValidator });
    
    // Suscribirse a cambios en el campo de contraseña para actualizar los indicadores de requisitos
    this.editForm.get('new_password')?.valueChanges.subscribe(value => {
      this.updatePasswordRequirements(value);
    });
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

  // Validador personalizado para verificar la fortaleza de la contraseña
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    // Si no hay valor, no validamos (la contraseña es opcional)
    if (!value) {
      return null;
    }
    
    // Requisitos mínimos
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);
    const minLength = value.length >= 8;
    
    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && minLength;
    
    if (!passwordValid) {
      return {
        passwordStrength: {
          hasUpperCase,
          hasLowerCase,
          hasNumeric,
          hasSpecialChar,
          minLength
        }
      };
    }
    
    return null;
  }
  
  // Actualiza los indicadores visuales de requisitos de contraseña
  updatePasswordRequirements(password: string) {
    if (!password) {
      this.passwordRequirements.forEach(req => req.valid = false);
      return;
    }
    
    this.passwordRequirements.find(req => req.id === 'minLength')!.valid = password.length >= 8;
    this.passwordRequirements.find(req => req.id === 'hasUppercase')!.valid = /[A-Z]/.test(password);
    this.passwordRequirements.find(req => req.id === 'hasLowercase')!.valid = /[a-z]/.test(password);
    this.passwordRequirements.find(req => req.id === 'hasNumber')!.valid = /[0-9]/.test(password);
    this.passwordRequirements.find(req => req.id === 'hasSpecial')!.valid = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
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
        
        // Verificar explícitamente que seguimos autenticados
        const isAuth = await this.authService.isAuthenticated();
        if (!isAuth) {
          // Si perdimos la autenticación, intentar recuperarla
          await this.authService.getUser(true);
          this.authService.setAuthStatus(true);
        }
        
        this.router.navigate(['/profile']); // Navegar después de una actualización exitosa
      } catch (error: any) {
        this.errorMessage = error?.response?.data?.message || 'Error al actualizar el perfil.';
      } finally {
        this.loading = false; // Asegurarse de que loading se establece en false
      }
    } else {
      // Si el formulario no es válido, marcar todos los campos como tocados para mostrar errores.
      this.editForm.markAllAsTouched();
    }
  }
}