import { Routes } from '@angular/router';

export const managerRoutes: Routes = [
  {
    path: 'projects',
    loadComponent: () => import('./project-management/project-management.component').then(m => m.ProjectManagementComponent)
  },
  {
    path: 'assignments',
    loadComponent: () => import('./assignment-management/assignment-management.component').then(m => m.AssignmentManagementComponent)
  },
  {
    path: 'approvals',
    loadComponent: () => import('./timesheet-approval/timesheet-approval.component').then(m => m.TimesheetApprovalComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./reports-dashboard/reports-dashboard.component').then(m => m.ReportsDashboardComponent)
  },
  { path: '', redirectTo: 'projects', pathMatch: 'full' }
];
