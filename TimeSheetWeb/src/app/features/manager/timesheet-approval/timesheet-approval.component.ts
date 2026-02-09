import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimesheetService } from '../../../core/services/timesheet.service';
import { Timesheet } from '../../../core/models/timesheet.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-timesheet-approval',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, NgClass, LoaderComponent],
  templateUrl: './timesheet-approval.component.html',
  styleUrls: ['./timesheet-approval.component.scss']
})
export class TimesheetApprovalComponent implements OnInit {
  pendingTimesheets = signal<Timesheet[]>([]);
  loading = signal(false);
  error = signal('');
  success = signal('');

  // For rejection modal
  showRejectModal = signal(false);
  selectedTimesheetId = signal<number | null>(null);
  rejectionComments = signal('');
  rejectLoading = signal(false);

  constructor(private timesheetService: TimesheetService) { }

  ngOnInit() {
    this.fetchPendingTimesheets();
  }

  fetchPendingTimesheets() {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');
    this.timesheetService.getPendingTimesheets().subscribe({
      next: (data) => {
        this.pendingTimesheets.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to load pending timesheets.');
        this.loading.set(false);
      }
    });
  }

  approveTimesheet(id: number) {
    if (!confirm('Are you sure you want to approve this timesheet?')) return;

    this.loading.set(true);
    this.timesheetService.approveTimesheet(id).subscribe({
      next: () => {
        this.success.set('Timesheet approved successfully.');
        this.loading.set(false);
        this.fetchPendingTimesheets();
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to approve timesheet.');
        this.loading.set(false);
      }
    });
  }

  openRejectModal(id: number) {
    this.selectedTimesheetId.set(id);
    this.rejectionComments.set('');
    this.showRejectModal.set(true);
  }

  closeRejectModal() {
    this.showRejectModal.set(false);
    this.selectedTimesheetId.set(null);
    this.rejectionComments.set('');
  }

  submitReject() {
    if (!this.rejectionComments().trim()) {
      this.error.set('Rejection comments are mandatory.');
      return;
    }

    const id = this.selectedTimesheetId();
    if (!id) return;

    this.rejectLoading.set(true);
    this.timesheetService.rejectTimesheet(id, this.rejectionComments()).subscribe({
      next: () => {
        this.success.set('Timesheet rejected with comments.');
        this.rejectLoading.set(false);
        this.closeRejectModal();
        this.fetchPendingTimesheets();
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to reject timesheet.');
        this.rejectLoading.set(false);
      }
    });
  }
}
