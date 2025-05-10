import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    await authService.getUser(); // Llama al backend
    return true; // Usuario autenticado
  } catch (error) {
    router.navigate(['/login']); // Redirige si no está autenticado
    return false;
  }
};
