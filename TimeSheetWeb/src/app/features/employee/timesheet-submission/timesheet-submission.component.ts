import { Component, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, NgClass, CommonModule } from '@angular/common';
import { TimesheetService } from '../../../core/services/timesheet.service';
import { ProjectAssignmentService } from '../../../core/services/project-assignment.service';
import { CreateTimesheetDto, Timesheet } from '../../../core/models/timesheet.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-timesheet-submission',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, NgClass, CommonModule, LoaderComponent],
  templateUrl: './timesheet-submission.component.html',
  styleUrls: ['./timesheet-submission.component.scss']
})
export class TimesheetSubmissionComponent implements OnInit {
  timesheetForm: FormGroup;

  // Signals for state management
  projects = signal<any[]>([]);
  error = signal('');
  success = signal('');
  loading = signal(false);
  timesheets = signal<Timesheet[]>([]);
  userId = signal<number | null>(null);

  constructor(
    private fb: FormBuilder,
    private timesheetService: TimesheetService,
    private projectAssignmentService: ProjectAssignmentService
  ) {
    this.timesheetForm = this.fb.group({
      entries: this.fb.array([])
    });
  }

  ngOnInit() {
    this.getUserId();
    this.fetchProjects();
    this.addEntry();
    this.fetchTimesheets();
  }

  getUserId() {
    const currentUser = localStorage.getItem('currentUser');
    this.userId.set(currentUser ? JSON.parse(currentUser).id : null);
  }

  get entries() {
    return this.timesheetForm.get('entries') as FormArray;
  }

  addEntry() {
    this.entries.push(this.fb.group({
      date: ['', Validators.required],
      projectCode: ['', Validators.required],
      hours: [0, [Validators.required, Validators.min(0), Validators.max(24)]],
      description: ['', Validators.required]
    }));
  }

  removeEntry(index: number) {
    this.entries.removeAt(index);
  }

  fetchProjects() {
    const id = this.userId();
    if (!id) {
      this.error.set('User not found.');
      return;
    }
    this.projectAssignmentService.getUserAssignments(id, true).subscribe({
      next: (data: any[]) => this.projects.set(data),
      error: () => this.error.set('Failed to load projects.')
    });
  }

  fetchTimesheets() {
    const id = this.userId();
    if (!id) return;
    this.timesheetService.getUserTimesheets(id).subscribe({
      next: (data) => this.timesheets.set(data),
      error: () => this.error.set('Failed to load timesheets.')
    });
  }

  validateNoDuplicates(): boolean {
    const seen = new Set();
    const hoursMap: { [key: string]: number } = {};
    for (let entry of this.entries.value) {
      const key = entry.date + '-' + entry.projectCode;
      if (seen.has(key)) return false;
      seen.add(key);
      hoursMap[key] = (hoursMap[key] || 0) + Number(entry.hours);
      if (hoursMap[key] > 24) return false;
    }
    return true;
  }

  saveAsDraft() {
    this.error.set('');
    this.success.set('');
    if (!this.validateNoDuplicates()) {
      this.error.set('Duplicate project/date entries or more than 24 hours for a project in a day are not allowed.');
      return;
    }
    if (this.entries.invalid) {
      this.error.set('Please fix form errors.');
      return;
    }
    this.loading.set(true);
    const createDtos: CreateTimesheetDto[] = this.entries.value.map((entry: any) => {
      const project = this.projects().find((p: any) => p.projectCode === entry.projectCode);
      return {
        projectId: project ? project.projectId || project.id : null,
        date: entry.date,
        hoursWorked: entry.hours,
        description: entry.description
      };
    });

    const invalidDtos = createDtos.filter(dto => !dto.projectId);
    if (invalidDtos.length > 0) {
      this.loading.set(false);
      this.error.set('Project not found for one or more entries.');
      return;
    }

    this.timesheetService.createTimesheetsBatch(createDtos).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(`${createDtos.length} draft timesheet(s) saved.`);
        this.entries.clear();
        this.addEntry();
        this.fetchTimesheets();
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Error saving timesheets as draft.');
      }
    });
  }

  private removeEmptyEntries() {
    for (let i = this.entries.length - 1; i >= 0; i--) {
      const entry = this.entries.at(i);
      if (entry.invalid) {
        this.entries.removeAt(i);
      }
    }
  }

  submitTimesheet() {
    this.error.set('');
    this.success.set('');
    this.removeEmptyEntries();

    if (this.timesheetForm.invalid || !this.validateNoDuplicates()) {
      this.error.set('Please fix errors before submitting. (No duplicates or >24h per project/day)');
      return;
    }
    this.loading.set(true);

    const createDtos: CreateTimesheetDto[] = this.entries.value.map((entry: any) => {
      const project = this.projects().find((p: any) => p.projectCode === entry.projectCode);
      return {
        projectId: project ? project.projectId || project.id : null,
        date: entry.date,
        hoursWorked: entry.hours,
        description: entry.description
      };
    });

    const invalidDtos = createDtos.filter(dto => !dto.projectId);
    if (invalidDtos.length > 0) {
      this.loading.set(false);
      this.error.set('Project not found for one or more entries.');
      return;
    }

    this.timesheetService.createTimesheetsBatch(createDtos).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Timesheet(s) submitted successfully.');
        this.entries.clear();
        this.addEntry();
        this.fetchTimesheets();
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Error submitting timesheets.');
      }
    });
  }

  submitDraftTimesheet(id: number) {
    this.loading.set(true);
    this.timesheetService.submitTimesheets({ timesheetIds: [id] }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Timesheet submitted.');
        this.fetchTimesheets();
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Error submitting timesheet.');
      }
    });
  }

  deleteTimesheet(id: number) {
    if (!confirm('Delete this timesheet?')) return;
    this.loading.set(true);
    this.timesheetService.deleteTimesheet(id).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Timesheet deleted.');
        this.fetchTimesheets();
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Error deleting timesheet.');
      }
    });
  }

  editTimesheet(ts: Timesheet) {
    this.entries.clear();
    this.entries.push(this.fb.group({
      date: [ts.date, Validators.required],
      projectCode: [ts.projectCode, Validators.required],
      hours: [ts.hoursWorked, [Validators.required, Validators.min(0), Validators.max(24)]],
      description: [ts.description, Validators.required]
    }));
  }
}