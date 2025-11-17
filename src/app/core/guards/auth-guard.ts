import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Redirigir al login si no está autenticado
    router.navigate(['/pages/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  return true;
};