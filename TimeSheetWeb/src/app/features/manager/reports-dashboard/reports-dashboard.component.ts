import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportService } from '../../../core/services/report.service';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

interface EmployeeHoursSummary {
  userId: number;
  userName: string;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
}

interface ProjectHoursSummary {
  projectId: number;
  projectCode: string;
  projectName: string;
  clientName: string;
  isBillable: boolean;
  totalHours: number;
}

interface BillableSummary {
  totalBillableHours: number;
  totalNonBillableHours: number;
  totalHours: number;
  billablePercentage: number;
}

interface ReportFilter {
  startDate: Date;
  endDate: Date;
  userId?: number;
  projectId?: number;
}

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoaderComponent],
  templateUrl: './reports-dashboard.component.html',
  styleUrls: ['./reports-dashboard.component.scss']
})
export class ReportsDashboardComponent implements OnInit {
  filterForm!: FormGroup;

  // Signals for state management
  employeeHoursSummary = signal<EmployeeHoursSummary[]>([]);
  projectHoursSummary = signal<ProjectHoursSummary[]>([]);
  billableSummary = signal<BillableSummary | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadReports();
  }

  private initializeForm(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

    this.filterForm = this.fb.group({
      startDate: [this.formatDate(thirtyDaysAgo), Validators.required],
      endDate: [this.formatDate(today), Validators.required],
      userId: [''],
      projectId: ['']
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadReports(): void {
    if (!this.filterForm.valid) {
      this.error.set('Please fill in all required fields');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const filter: ReportFilter = {
      startDate: new Date(this.filterForm.get('startDate')?.value),
      endDate: new Date(this.filterForm.get('endDate')?.value),
      userId: this.filterForm.get('userId')?.value ? parseInt(this.filterForm.get('userId')?.value) : undefined,
      projectId: this.filterForm.get('projectId')?.value ? parseInt(this.filterForm.get('projectId')?.value) : undefined
    };

    Promise.all([
      this.getEmployeeHoursSummary(filter),
      this.getProjectHoursSummary(filter),
      this.getBillableSummary(filter)
    ]).finally(() => {
      this.isLoading.set(false);
    });
  }

  private getEmployeeHoursSummary(filter: ReportFilter): Promise<void> {
    return new Promise((resolve) => {
      this.reportService.getEmployeeHoursSummary(filter).subscribe({
        next: (data) => {
          this.employeeHoursSummary.set(data);
          resolve();
        },
        error: (err) => {
          console.error('Error loading employee hours summary:', err);
          this.error.set('Failed to load employee hours summary');
          resolve();
        }
      });
    });
  }

  private getProjectHoursSummary(filter: ReportFilter): Promise<void> {
    return new Promise((resolve) => {
      this.reportService.getProjectHoursSummary(filter).subscribe({
        next: (data) => {
          this.projectHoursSummary.set(data);
          resolve();
        },
        error: (err) => {
          console.error('Error loading project hours summary:', err);
          this.error.set('Failed to load project hours summary');
          resolve();
        }
      });
    });
  }

  private getBillableSummary(filter: ReportFilter): Promise<void> {
    return new Promise((resolve) => {
      this.reportService.getBillableSummary(filter).subscribe({
        next: (data) => {
          this.billableSummary.set(data);
          resolve();
        },
        error: (err) => {
          console.error('Error loading billable summary:', err);
          this.error.set('Failed to load billable summary');
          resolve();
        }
      });
    });
  }

  resetFilters(): void {
    this.initializeForm();
    this.loadReports();
  }

  exportToCSV(): void {
    // Implementation for CSV export can be added here
    console.log('Export to CSV functionality');
  }
}
