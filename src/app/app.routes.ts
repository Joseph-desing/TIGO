import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [

  // Splash
  {
    path: 'pages/splash',
    loadComponent: () =>
      import('./pages/splash/splash.page').then(m => m.SplashPage)
  },

  // Login
  {
    path: 'pages/auth/login',
    loadComponent: () =>
      import('./pages/auth/login/login.page').then(m => m.LoginPage)
  },

  // Registro
  {
    path: 'pages/auth/register',
    loadComponent: () =>
      import('./pages/auth/register/register.page').then(m => m.RegisterPage)
  },

  // Tabs
  {
    path: 'tabs',
    loadChildren: () =>
      import('./tabs/tabs.routes').then(m => m.routes),
  },

  // Detalle de plan
  {
    path: 'pages/detalle-plan/:id',
    loadComponent: () =>
      import('./pages/detalle-plan/detalle-plan.page').then(m => m.DetallePlanPage)
  },

  // Chat (requiere login)
  {
    path: 'pages/chat/:contratacionId',
    loadComponent: () =>
      import('./pages/chat/chat.page').then(m => m.ChatPage),
    canActivate: [authGuard]
  },

  // Dashboard ASESOR
  {
    path: 'pages/dashboard-asesor',
    loadComponent: () =>
      import('./pages/dashboard-asesor/dashboard-asesor.page')
        .then(m => m.DashboardAsesorPage),
    canActivate: [authGuard, roleGuard],
    data: { role: 'asesor_comercial' }
  },

  // Dashboard USUARIO
  {
    path: 'pages/dashboard-usuario',
    loadComponent: () =>
      import('./pages/dashboard-usuario/dashboard-usuario.page')
        .then(m => m.DashboardUsuarioPage),
    canActivate: [authGuard, roleGuard],
    data: { role: 'usuario_registrado' }
  },

  // 🔵 Dashboard INVITADO (SIN guards)
  {
    path: 'pages/dashboard-invitado',
    loadComponent: () =>
      import('./pages/dashboard-invitado/dashboard-invitado.page')
        .then(m => m.DashboardInvitadoPage)
  },

  // Ruta por defecto → splash
  {
    path: '',
    redirectTo: 'pages/splash',
    pathMatch: 'full'
  },

  // Cualquier ruta desconocida → splash (SIEMPRE al final)
  {
    path: '**',
    redirectTo: 'pages/splash'
  }
];
