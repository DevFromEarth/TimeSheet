import { Routes } from '@angular/router';

export const employeeRoutes: Routes = [
  {
    path: 'timesheets',
    loadComponent: () => import('./timesheet-submission/timesheet-submission.component').then(m => m.TimesheetSubmissionComponent)
  },
  { path: '', redirectTo: 'timesheets', pathMatch: 'full' }
];
