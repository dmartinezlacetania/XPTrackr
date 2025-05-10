import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

<<<<<<< HEAD
  const user = await authService.getUser(); // Llama al backend y obtiene el usuario o null

  if (user) {
    return true; // Usuario autenticado, permite el acceso
  } else {
    router.navigate(['/login']); // No autenticado o error, redirige a login
=======
  try {
    await authService.getUser(); // Llama al backend
    return true; // Usuario autenticado
  } catch (error) {
    router.navigate(['/login']); // Redirige si no está autenticado
>>>>>>> c97cefb7cbba9054ffe2602e699819683202ed10
    return false;
  }
};
