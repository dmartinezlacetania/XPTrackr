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
  profileForm: FormGroup;
  passwordForm: FormGroup;
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
    // Formulario para datos básicos del perfil
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
    
    // Formulario para cambio de contraseña
    this.passwordForm = this.fb.group({
      current_password: ['', Validators.required],
      new_password: ['', [this.passwordStrengthValidator]],
      new_password_confirmation: ['']
    }, { validators: this.passwordMatchValidator });
    
    // Suscribirse a cambios en el campo de contraseña para actualizar los indicadores de requisitos
    this.passwordForm.get('new_password')?.valueChanges.subscribe(value => {
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
        this.profileForm.patchValue({
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

  async onSubmitProfile() {
    if (this.profileForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      try {
        // Enviar solo los datos del perfil
        await this.authService.updateProfile(this.profileForm.value);
        
        // Verificar explícitamente que seguimos autenticados
        const isAuth = await this.authService.isAuthenticated();
        if (!isAuth) {
          await this.authService.getUser(true);
          this.authService.setAuthStatus(true);
        }
        
        // this.router.navigate(['/profile']);
      } catch (error: any) {
        this.errorMessage = error?.response?.data?.message || 'Error al actualizar el perfil.';
      } finally {
        this.loading = false;
      }
    } else {
      this.profileForm.markAllAsTouched();
    }
  }

  async onSubmitPassword() {
    if (this.passwordForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      try {
        // Enviar solo los datos de cambio de contraseña
        await this.authService.updateProfile(this.passwordForm.value);
        
        // Verificar explícitamente que seguimos autenticados
        const isAuth = await this.authService.isAuthenticated();
        if (!isAuth) {
          await this.authService.getUser(true);
          this.authService.setAuthStatus(true);
        }
        
        this.router.navigate(['/profile']);
      } catch (error: any) {
        this.errorMessage = error?.response?.data?.message || 'Error al actualizar la contraseña.';
      } finally {
        this.loading = false;
      }
    } else {
      this.passwordForm.markAllAsTouched();
    }
  }
  
  async onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const file = input.files[0];
  
    // Validar el tipo de archivo
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Por favor, selecciona una imagen válida.';
      return;
    }
  
    // Validar el tamaño del archivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.errorMessage = 'La imagen no debe superar los 2MB.';
      return;
    }
  
    const formData = new FormData();
    formData.append('avatar', file);
  
    this.loading = true;
    this.errorMessage = '';
  
    try {
      await this.authService.uploadAvatar(formData);
      // Recarga los datos del usuario para mostrar el nuevo avatar
      await this.loadUserData();
    } catch (error: any) {
      this.errorMessage = error?.response?.data?.message || 'Error al subir el avatar.';
    } finally {
      this.loading = false;
    }
  }

  get avatarUrl(): string {
    if (this.user?.avatar) {
      return this.authService.getAvatarUrl(this.user.avatar);
    }
    console.log(this.user?.avatar);
    // Puedes poner una imagen por defecto si no hay avatar
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.user?.name || 'U');
  }
}