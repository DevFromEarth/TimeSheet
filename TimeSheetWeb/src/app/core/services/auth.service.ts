import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User, LoginResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl || 'https://localhost:7299/api';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private tokenKey = 'authToken';
  private currentUserKey = 'currentUser';

  constructor() {
    const userStr = localStorage.getItem(this.currentUserKey);
    this.currentUserSubject = new BehaviorSubject<User | null>(
      userStr ? JSON.parse(userStr) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get authToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/Auth/login`, { email, password })
      .pipe(
        tap(response => {
          // Store token
          localStorage.setItem(this.tokenKey, response.token);
          // Store user
          localStorage.setItem(this.currentUserKey, JSON.stringify(response.user));
          // Update current user subject
          this.currentUserSubject.next(response.user);
        }),
        map(response => response.user)
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.currentUserKey);
    this.currentUserSubject.next(null);
  }
}
