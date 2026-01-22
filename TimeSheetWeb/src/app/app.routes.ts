import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'employee',
    canActivate: [authGuard, roleGuard(['Employee'])],
    children: [
      {
        path: 'timesheets',
        loadComponent: () => import('./features/employee/timesheet-entry.component').then(m => m.TimesheetEntryComponent)
      },
      { path: '', redirectTo: 'timesheets', pathMatch: 'full' }
    ]
  },
  {
    path: 'manager',
    canActivate: [authGuard, roleGuard(['Manager'])],
    children: [
      {
        path: 'projects',
        loadComponent: () => import('./features/manager/project-management.component').then(m => m.ProjectManagementComponent)
      },
      {
        path: 'assignments',
        loadComponent: () => import('./features/manager/assignment-management.component').then(m => m.AssignmentManagementComponent)
      },
      {
        path: 'approvals',
        loadComponent: () => import('./features/manager/timesheet-approval.component').then(m => m.TimesheetApprovalComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/manager/reports.component').then(m => m.ReportsComponent)
      },
      { path: '', redirectTo: 'projects', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
