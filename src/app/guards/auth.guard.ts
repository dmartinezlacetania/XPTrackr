// Importem les funcions i classes necessàries dels mòduls d'Angular
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

// Definim el guard d'autenticació que protegeix les rutes
export const authGuard: CanActivateFn = async (route, state) => {
  // Injectem els serveis que necessitem
  const authService = inject(AuthService);
  const router = inject(Router);

  // Obtenim l'usuari actual
  const user = await authService.getUser(); 

  // Si hi ha un usuari autenticat, permetem l'accés
  if (user) {
    return true;
  } else {
    // Si no hi ha usuari, redirigim al login i deneguem l'accés
    router.navigate(['/login']);
    return false;
  }
};
