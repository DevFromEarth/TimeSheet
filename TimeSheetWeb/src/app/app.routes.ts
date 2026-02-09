import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';
import { managerRoutes } from './features/manager/manager.routes';
import { employeeRoutes } from './features/employee/employee.routes';
import { authRoutes } from './features/auth/auth.routes';

export const routes: Routes = [
  {
    path: 'auth',
    children: authRoutes
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'employee',
    canActivate: [authGuard, roleGuard(['Employee'])],
    children: employeeRoutes
  },
  {
    path: 'manager',
    canActivate: [authGuard, roleGuard(['Manager'])],
    children: managerRoutes
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
