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

  // Tabs principales de usuario
  {
    path: 'tabs',
    loadChildren: () =>
      import('./tabs/tabs.routes').then(m => m.routes),
  },

  // Detalle de plan (para usuarios)
  {
    path: 'pages/detalle-plan/:id',
    loadComponent: () =>
      import('./pages/detalle-plan/detalle-plan.page').then(m => m.DetallePlanPage)
  },

  // Chat (puedes poner guard si quieres que solo usuarios logueados entren)
  {
    path: 'chat',
    loadComponent: () =>
      import('./pages/chat/chat.page').then(m => m.ChatPage),
    // canActivate: [authGuard],
  },

  // Dashboard ASESOR
  {
    path: 'pages/dashboard-asesor',
    loadComponent: () =>
      import('./pages/dashboard-asesor/dashboard-asesor.page')
        .then(m => m.DashboardAsesorPage),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['asesor_comercial'] }   
  },

  // Página para CREAR NUEVO PLAN (asesor)
  {
    path: 'pages/crear-plan',
    loadComponent: () =>
      import('./pages/crear-plan/crear-plan.page')
        .then(m => m.CrearPlanPage),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['asesor_comercial'] }  
  },
  {
  path: 'pages/solicitudes-asesor',
  loadComponent: () =>
    import('./pages/solicitudes-asesor/solicitudes-asesor.page')
      .then(m => m.SolicitudesAsesorPage),
  canActivate: [authGuard, roleGuard],
  data: { roles: ['asesor_comercial'] }
},
{
  path: 'pages/chats-asesor',
  loadComponent: () =>
    import('./pages/chats-asesor/chats-asesor.page')
      .then(m => m.ChatsAsesorPage),
  canActivate: [authGuard, roleGuard],
  data: { roles: ['asesor_comercial'] }
},

{
  path: 'pages/perfil-asesor',
  loadComponent: () =>
    import('./pages/perfil-asesor/perfil-asesor.page')
      .then(m => m.PerfilAsesorPage),
  canActivate: [authGuard, roleGuard],
  data: { roles: ['asesor_comercial'] }
},

  // Dashboard USUARIO REGISTRADO
  {
    path: 'pages/dashboard-usuario',
    loadComponent: () =>
      import('./pages/dashboard-usuario/dashboard-usuario.page')
        .then(m => m.DashboardUsuarioPage),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['usuario_registrado'] } // ✅ unificado
  },

  // Dashboard INVITADO (SIN guards)
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
