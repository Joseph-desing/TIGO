import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'tab1',   // Inicio / Catálogo
        loadComponent: () =>
          import('../tab1/tab1.page').then(m => m.Tab1Page)
      },
      {
        path: 'tab2',   // Mis contrataciones
        loadComponent: () =>
          import('../tab2/tab2.page').then(m => m.Tab2Page)
      },
      {
        path: 'tab3',   // Perfil
        loadComponent: () =>
          import('../tab3/tab3.page').then(m => m.Tab3Page)
      },
      {
        path: '',
        redirectTo: 'tab1',
        pathMatch: 'full'
      }
    ]
  }
];
