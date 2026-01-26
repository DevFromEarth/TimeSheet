import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportService } from '../../../core/services/report.service';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reports-dashboard.component.html',
  styleUrls: ['./reports-dashboard.component.scss']
})
export class ReportsDashboardComponent implements OnInit {
  filterForm!: FormGroup;
  employeeHoursSummary: EmployeeHoursSummary[] = [];
  projectHoursSummary: ProjectHoursSummary[] = [];
  billableSummary: BillableSummary | null = null;

  isLoading = false;
  error: string | null = null;

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
      this.error = 'Please fill in all required fields';
      return;
    }

    this.isLoading = true;
    this.error = null;

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
      this.isLoading = false;
    });
  }

  private getEmployeeHoursSummary(filter: ReportFilter): void {
    this.reportService.getEmployeeHoursSummary(filter).subscribe({
      next: (data) => {
        this.employeeHoursSummary = data;
      },
      error: (err) => {
        console.error('Error loading employee hours summary:', err);
        this.error = 'Failed to load employee hours summary';
      }
    });
  }

  private getProjectHoursSummary(filter: ReportFilter): void {
    this.reportService.getProjectHoursSummary(filter).subscribe({
      next: (data) => {
        this.projectHoursSummary = data;
      },
      error: (err) => {
        console.error('Error loading project hours summary:', err);
        this.error = 'Failed to load project hours summary';
      }
    });
  }

  private getBillableSummary(filter: ReportFilter): void {
    this.reportService.getBillableSummary(filter).subscribe({
      next: (data) => {
        this.billableSummary = data;
      },
      error: (err) => {
        console.error('Error loading billable summary:', err);
        this.error = 'Failed to load billable summary';
      }
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
