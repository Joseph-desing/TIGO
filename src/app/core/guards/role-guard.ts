import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';
import { UserRole } from '../models';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data['role'] as UserRole;
  const user = authService.getCurrentUser();

  if (!user) {
    router.navigate(['/pages/auth/login']);
    return false;
  }

  if (requiredRole && user.rol !== requiredRole) {
    // Si es asesor intentando acceder a ruta de usuario, redirigir a dashboard
    if (user.rol === 'asesor_comercial') {
      router.navigate(['/pages/dashboard-asesor']);
    } else {
      // Si es usuario intentando acceder a ruta de asesor, redirigir a tabs
      router.navigate(['/tabs/tab1']);
    }
    return false;
  }

  return true;
};