import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Timesheet Management System</h2>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              class="form-control"
              placeholder="manager@example.com or employee@example.com"
              [disabled]="isLoading">
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password" 
              class="form-control"
              placeholder="Manager123! or Employee123!"
              [disabled]="isLoading">
          </div>

          @if (errorMessage) {
            <div class="alert alert-danger">{{ errorMessage }}</div>
          }

          <button type="submit" [disabled]="loginForm.invalid || isLoading" class="btn btn-primary">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <div class="demo-credentials">
          <h4>Demo Credentials:</h4>
          <p><strong>Manager:</strong> manager@example.com / Manager123!</p>
          <p><strong>Employee:</strong> employee@example.com / Employee123!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      // background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .login-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 400px;
    }
    .login-card h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #555;
    }
    .form-control {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
    }
    .form-control:focus {
      outline: none;
      border-color: #667eea;
    }
    .form-control:disabled {
      background: #f5f5f5;
      cursor: not-allowed;
    }
    .btn {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }
    .btn-primary {
      background: #667eea;
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
      background: #5568d3;
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .alert {
      padding: 10px;
      margin-bottom: 15px;
      border-radius: 5px;
    }
    .alert-danger {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    .demo-credentials {
      margin-top: 30px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 5px;
      font-size: 13px;
    }
    .demo-credentials h4 {
      margin-top: 0;
      margin-bottom: 10px;
      color: #666;
    }
    .demo-credentials p {
      margin: 5px 0;
      color: #555;
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (user) => {
          this.isLoading = false;
          if (user.role === 'Manager') {
            this.router.navigate(['/manager']);
          } else {
            this.router.navigate(['/employee']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Login error:', error);
          if (error.status === 401) {
            this.errorMessage = 'Invalid email or password';
          } else if (error.status === 0) {
            this.errorMessage = 'Cannot connect to server. Please check your connection.';
          } else {
            this.errorMessage = error.error?.message || 'Login failed. Please try again.';
          }
        }
      });
    }
  }
}
