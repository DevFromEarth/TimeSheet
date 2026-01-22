import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  protected http = inject(HttpClient);
  private baseUrl = environment.apiUrl || 'https://localhost:7299/api';

  protected get<T>(url: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${url}`, { headers: this.getHeaders() });
  }

  protected post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${url}`, body, { headers: this.getHeaders() });
  }

  protected put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${url}`, body, { headers: this.getHeaders() });
  }

  protected delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${url}`, { headers: this.getHeaders() });
  }

  private getHeaders(): HttpHeaders {
    const currentUser = this.getCurrentUser();
    const headers: any = {
      'Content-Type': 'application/json'
    };

    if (currentUser) {
      headers['X-User-Id'] = currentUser.id.toString();
    }

    return new HttpHeaders(headers);
  }

  private getCurrentUser(): any {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
}
