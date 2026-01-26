import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, NgClass } from '@angular/common';
import { TimesheetService } from '../../../core/services/timesheet.service';
import { ProjectAssignmentService } from '../../../core/services/project-assignment.service';
import { CreateTimesheetDto, Timesheet } from '../../../core/models/timesheet.model';

@Component({
  selector: 'app-timesheet-submission',
  imports: [ReactiveFormsModule, DatePipe, NgClass],
  templateUrl: './timesheet-submission.component.html',
  styleUrls: ['./timesheet-submission.component.scss']
})
export class TimesheetSubmissionComponent implements OnInit {
  timesheetForm: FormGroup;
  projects: any[] = [];
  error: string = '';
  success: string = '';
  loading: boolean = false;
  timesheets: Timesheet[] = [];
  userId: number | null = null;

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
    this.userId = currentUser ? JSON.parse(currentUser).id : null;
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
    if (!this.userId) {
      this.error = 'User not found.';
      return;
    }
    this.projectAssignmentService.getUserAssignments(this.userId, true).subscribe({
      next: (data: any[]) => this.projects = data,
      error: () => this.error = 'Failed to load projects.'
    });
  }

  fetchTimesheets() {
    if (!this.userId) return;
    this.timesheetService.getUserTimesheets(this.userId).subscribe({
      next: (data) => this.timesheets = data,
      error: () => this.error = 'Failed to load timesheets.'
    });
  }

  validateNoDuplicates(): boolean {
    const seen = new Set();
    const hoursMap: { [key: string]: number } = {};
    for (let entry of this.entries.value) {
      const key = entry.date + '-' + entry.projectCode;
      if (seen.has(key)) return false;
      seen.add(key);
      // Sum hours for each project/date
      hoursMap[key] = (hoursMap[key] || 0) + Number(entry.hours);
      if (hoursMap[key] > 24) return false;
    }
    return true;
  }

  saveAsDraft() {
    this.error = '';
    this.success = '';
    if (!this.validateNoDuplicates()) {
      this.error = 'Duplicate project/date entries or more than 24 hours for a project in a day are not allowed.';
      return;
    }
    if (this.entries.invalid) {
      this.error = 'Please fix form errors.';
      return;
    }
    this.loading = true;
    const createDtos: CreateTimesheetDto[] = this.entries.value.map((entry: any) => {
      const project = this.projects.find((p: any) => p.projectCode === entry.projectCode);
      return {
        projectId: project ? project.projectId || project.id : null,
        date: entry.date,
        hoursWorked: entry.hours,
        description: entry.description
      };
    });

    // Validate all DTOs have projectId
    const invalidDtos = createDtos.filter(dto => !dto.projectId);
    if (invalidDtos.length > 0) {
      this.loading = false;
      this.error = 'Project not found for one or more entries.';
      return;
    }

    // Send all entries as a batch
    this.timesheetService.createTimesheetsBatch(createDtos).subscribe({
      next: () => {
        this.loading = false;
        this.success = `${createDtos.length} draft timesheet(s) saved.`;
        this.entries.clear();
        this.addEntry();
        this.fetchTimesheets();
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.error?.message || 'Error saving timesheets as draft.';
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
    this.error = '';
    this.success = '';
    this.removeEmptyEntries();
    console.log(this.timesheetForm.invalid);
    console.log(!this.validateNoDuplicates());

    if (this.timesheetForm.invalid || !this.validateNoDuplicates()) {
      this.error = 'Please fix errors before submitting. (No duplicates or >24h per project/day)';
      return;
    }
    this.loading = true;

    const createDtos: CreateTimesheetDto[] = this.entries.value.map((entry: any) => {
      const project = this.projects.find((p: any) => p.projectCode === entry.projectCode);
      return {
        projectId: project ? project.projectId || project.id : null,
        date: entry.date,
        hoursWorked: entry.hours,
        description: entry.description
      };
    });

    // Validate all DTOs have projectId
    const invalidDtos = createDtos.filter(dto => !dto.projectId);
    if (invalidDtos.length > 0) {
      this.loading = false;
      this.error = 'Project not found for one or more entries.';
      return;
    }

    // Send all entries as a batch
    this.timesheetService.createTimesheetsBatch(createDtos).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Timesheet(s) submitted successfully.';
        this.entries.clear();
        this.addEntry();
        this.fetchTimesheets();
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.error?.message || 'Error submitting timesheets.';
      }
    });
  }

  submitDraftTimesheet(id: number) {
    this.loading = true;
    this.timesheetService.submitTimesheets({ timesheetIds: [id] }).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Timesheet submitted.';
        this.fetchTimesheets();
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.error?.message || 'Error submitting timesheet.';
      }
    });
  }

  deleteTimesheet(id: number) {
    if (!confirm('Delete this timesheet?')) return;
    this.loading = true;
    this.timesheetService.deleteTimesheet(id).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Timesheet deleted.';
        this.fetchTimesheets();
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.error?.message || 'Error deleting timesheet.';
      }
    });
  }

  editTimesheet(ts: Timesheet) {
    // Populate form with selected timesheet for editing
    this.entries.clear();
    this.entries.push(this.fb.group({
      date: [ts.date, Validators.required],
      projectCode: [ts.projectCode, Validators.required],
      hours: [ts.hoursWorked, [Validators.required, Validators.min(0), Validators.max(24)]],
      description: [ts.description, Validators.required]
    }));
  }
}