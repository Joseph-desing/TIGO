import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';
import { UserRole } from '../models';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // usamos "roles" como arreglo en las rutas
  const requiredRoles = route.data['roles'] as UserRole[] | undefined;
  const user = authService.getCurrentUser();

  console.log('🔎 roleGuard -> user:', user);
  console.log('🔎 requiredRoles:', requiredRoles);

  // Si no hay usuario, lo mandamos a login
  if (!user) {
    router.navigate(['/pages/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // Si la ruta no define roles, se deja pasar
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Si el rol del usuario NO está en los roles permitidos:
  if (!requiredRoles.includes(user.rol as UserRole)) {
    console.warn(
      '⛔ Acceso denegado. Rol requerido:',
      requiredRoles,
      'Rol actual:',
      user.rol
    );

    // Si es asesor y trata de entrar a algo de usuarios
    if (user.rol === 'asesor_comercial') {
      router.navigate(['/pages/dashboard-asesor']);
    } else {
      // Si es usuario normal u otro, lo mandamos a las tabs de usuario
      router.navigate(['/tabs/tab1']);
    }
    return false;
  }

  // Tiene rol correcto → puede pasar
  return true;
};
