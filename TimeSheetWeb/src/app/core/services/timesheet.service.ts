import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Timesheet,
  CreateTimesheetDto,
  UpdateTimesheetDto,
  SubmitTimesheetDto,
  RejectTimesheetDto
} from '../models/timesheet.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService extends ApiService {
  getUserTimesheets(userId: number): Observable<Timesheet[]> {
    return this.get<Timesheet[]>(`timesheets/user/${userId}`);
  }

  getTimesheetById(id: number): Observable<Timesheet> {
    return this.get<Timesheet>(`timesheets/${id}`);
  }

  getPendingTimesheets(): Observable<Timesheet[]> {
    return this.get<Timesheet[]>('timesheets/pending');
  }

  createTimesheet(dto: CreateTimesheetDto): Observable<Timesheet> {
    return this.post<Timesheet>('timesheets', dto);
  }

  updateTimesheet(id: number, dto: UpdateTimesheetDto): Observable<Timesheet> {
    return this.put<Timesheet>(`timesheets/${id}`, dto);
  }

  deleteTimesheet(id: number): Observable<void> {
    return this.delete<void>(`timesheets/${id}`);
  }

  createTimesheetsBatch(dtos: CreateTimesheetDto[]): Observable<void> {
    return this.post<void>('timesheets/daily', dtos);
  }

  submitTimesheets(dto: SubmitTimesheetDto): Observable<void> {
    return this.post<void>('timesheets/submit', dto);
  }

  approveTimesheet(id: number): Observable<void> {
    return this.post<void>(`timesheets/${id}/approve`, {});
  }

  rejectTimesheet(id: number, rejectionComments: string): Observable<void> {
    return this.post<void>(`timesheets/${id}/reject`, { rejectionComments });
  }
}
