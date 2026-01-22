import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  EmployeeHoursSummary, 
  ProjectHoursSummary, 
  BillableSummary,
  ReportFilter 
} from '../models/report.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService extends ApiService {
  getEmployeeHoursSummary(filter: ReportFilter): Observable<EmployeeHoursSummary[]> {
    return this.post<EmployeeHoursSummary[]>('reports/employee-hours', filter);
  }

  getProjectHoursSummary(filter: ReportFilter): Observable<ProjectHoursSummary[]> {
    return this.post<ProjectHoursSummary[]>('reports/project-hours', filter);
  }

  getBillableSummary(filter: ReportFilter): Observable<BillableSummary> {
    return this.post<BillableSummary>('reports/billable-summary', filter);
  }
}
