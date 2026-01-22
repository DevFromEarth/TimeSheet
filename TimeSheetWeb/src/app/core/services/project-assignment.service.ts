import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  ProjectAssignment, 
  CreateProjectAssignmentDto, 
  UpdateProjectAssignmentDto 
} from '../models/project-assignment.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectAssignmentService extends ApiService {
  getUserAssignments(userId: number, activeOnly: boolean = false): Observable<ProjectAssignment[]> {
    const url = activeOnly 
      ? `projectassignments/user/${userId}?activeOnly=true`
      : `projectassignments/user/${userId}`;
    return this.get<ProjectAssignment[]>(url);
  }

  getProjectAssignments(projectId: number): Observable<ProjectAssignment[]> {
    return this.get<ProjectAssignment[]>(`projectassignments/project/${projectId}`);
  }

  createAssignment(dto: CreateProjectAssignmentDto): Observable<ProjectAssignment> {
    return this.post<ProjectAssignment>('projectassignments', dto);
  }

  updateAssignment(id: number, dto: UpdateProjectAssignmentDto): Observable<ProjectAssignment> {
    return this.put<ProjectAssignment>(`projectassignments/${id}`, dto);
  }

  deleteAssignment(id: number): Observable<void> {
    return this.delete<void>(`projectassignments/${id}`);
  }
}
