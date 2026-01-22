import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Project, CreateProjectDto, UpdateProjectDto } from '../models/project.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService extends ApiService {
  getAllProjects(): Observable<Project[]> {
    return this.get<Project[]>('projects');
  }

  getProjects(activeOnly: boolean = false): Observable<Project[]> {
    const url = activeOnly ? 'projects?activeOnly=true' : 'projects';
    return this.get<Project[]>(url);
  }

  getProjectById(id: number): Observable<Project> {
    return this.get<Project>(`projects/${id}`);
  }

  createProject(dto: CreateProjectDto): Observable<Project> {
    return this.post<Project>('projects', dto);
  }

  updateProject(id: number, dto: UpdateProjectDto): Observable<Project> {
    return this.put<Project>(`projects/${id}`, dto);
  }

  deactivateProject(id: number): Observable<void> {
    return this.post<void>(`projects/${id}/deactivate`, {});
  }

  activateProject(id: number): Observable<void> {
    return this.post<void>(`projects/${id}/activate`, {});
  }
}
