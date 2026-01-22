import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-timesheet-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="timesheet-entry-container">
      <h2>Timesheet Entry</h2>
      
      <!-- Stats using Angular Signals -->
      <div class="stats-panel">
        <div class="stat-card">
          <h3>Draft</h3>
          <p>{{ draftCount() }}</p>
        </div>
        <div class="stat-card">
          <h3>Submitted</h3>
          <p>{{ submittedCount() }}</p>
        </div>
        <div class="stat-card">
          <h3>Approved</h3>
          <p>{{ approvedCount() }}</p>
        </div>
      </div>

      <!-- Timesheet Form -->
      <div class="form-container">
        <h3>{{ isEditMode() ? 'Edit' : 'Add' }} Timesheet</h3>
        <form [formGroup]="timesheetForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="projectId">Project *</label>
            <select id="projectId" formControlName="projectId" class="form-control">
              <option value="">Select Project</option>
            </select>
            @if (timesheetForm.get('projectId')?.invalid && timesheetForm.get('projectId')?.touched) {
              <div class="error">Project is required</div>
            }
          </div>

          <div class="form-group">
            <label for="date">Date *</label>
            <input 
              type="date" 
              id="date" 
              formControlName="date" 
              class="form-control"
              [max]="today()">
            @if (timesheetForm.get('date')?.invalid && timesheetForm.get('date')?.touched) {
              <div class="error">Date is required</div>
            }
          </div>

          <div class="form-group">
            <label for="hoursWorked">Hours Worked *</label>
            <input 
              type="number" 
              id="hoursWorked" 
              formControlName="hoursWorked" 
              class="form-control"
              min="0.1"
              max="24"
              step="0.5">
            @if (timesheetForm.get('hoursWorked')?.invalid && timesheetForm.get('hoursWorked')?.touched) {
              <div class="error">Hours must be between 0.1 and 24</div>
            }
          </div>

          <div class="form-group">
            <label for="description">Description *</label>
            <textarea 
              id="description" 
              formControlName="description" 
              class="form-control"
              rows="3"></textarea>
            @if (timesheetForm.get('description')?.invalid && timesheetForm.get('description')?.touched) {
              <div class="error">Description is required</div>
            }
          </div>

          <div class="form-actions">
            <button type="submit" [disabled]="timesheetForm.invalid || loading()" class="btn btn-primary">
              {{ isEditMode() ? 'Update' : 'Add' }} Timesheet
            </button>
            @if (isEditMode()) {
              <button type="button" (click)="cancelEdit()" class="btn btn-secondary">Cancel</button>
            }
          </div>
        </form>
      </div>

      <!-- Timesheets List -->
      <div class="timesheets-list">
        <h3>My Timesheets</h3>
        <p>Timesheet list will be displayed here.</p>
      </div>
    </div>
  `,
  styles: [`
    .timesheet-entry-container { padding: 20px; }
    .stats-panel { display: flex; gap: 20px; margin-bottom: 30px; }
    .stat-card { 
      flex: 1; 
      padding: 20px; 
      background: #f5f5f5; 
      border-radius: 8px;
      text-align: center;
    }
    .stat-card h3 { margin: 0 0 10px 0; color: #666; }
    .stat-card p { font-size: 32px; font-weight: bold; margin: 0; }
    .form-container { 
      background: white; 
      padding: 20px; 
      border-radius: 8px; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
    .form-control { 
      width: 100%; 
      padding: 8px 12px; 
      border: 1px solid #ddd; 
      border-radius: 4px;
    }
    .error { color: #dc3545; font-size: 14px; margin-top: 5px; }
    .form-actions { display: flex; gap: 10px; margin-top: 20px; }
    .btn { 
      padding: 10px 20px; 
      border: none; 
      border-radius: 4px; 
      cursor: pointer;
      font-weight: 500;
    }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-primary { background: #007bff; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    .timesheets-list { 
      background: white; 
      padding: 20px; 
      border-radius: 8px; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `]
})
export class TimesheetEntryComponent implements OnInit {
  private fb = inject(FormBuilder);
  
  timesheetForm: FormGroup;
  
  // Angular Signals for local UI state
  isEditMode = signal(false);
  loading = signal(false);
  draftCount = signal(0);
  submittedCount = signal(0);
  approvedCount = signal(0);
  today = signal(new Date().toISOString().split('T')[0]);

  constructor() {
    this.timesheetForm = this.fb.group({
      projectId: ['', Validators.required],
      date: ['', Validators.required],
      hoursWorked: [0, [Validators.required, Validators.min(0.1), Validators.max(24)]],
      description: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Load data here
  }

  onSubmit() {
    if (this.timesheetForm.valid) {
      console.log('Timesheet submitted:', this.timesheetForm.value);
      this.resetForm();
    }
  }

  cancelEdit() {
    this.resetForm();
  }

  resetForm() {
    this.isEditMode.set(false);
    this.timesheetForm.reset();
  }
}

