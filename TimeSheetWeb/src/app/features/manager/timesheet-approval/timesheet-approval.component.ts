import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimesheetService } from '../../../core/services/timesheet.service';
import { Timesheet } from '../../../core/models/timesheet.model';

@Component({
  selector: 'app-timesheet-approval',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, NgClass],
  templateUrl: './timesheet-approval.component.html',
  styleUrls: ['./timesheet-approval.component.scss']
})
export class TimesheetApprovalComponent implements OnInit {
  pendingTimesheets: Timesheet[] = [];
  loading: boolean = false;
  error: string = '';
  success: string = '';

  // For rejection modal
  showRejectModal: boolean = false;
  selectedTimesheetId: number | null = null;
  rejectionComments: string = '';
  rejectLoading: boolean = false;

  constructor(private timesheetService: TimesheetService) { }

  ngOnInit() {
    this.fetchPendingTimesheets();
  }

  fetchPendingTimesheets() {
    this.loading = true;
    this.error = '';
    this.success = '';
    this.timesheetService.getPendingTimesheets().subscribe({
      next: (data) => {
        this.pendingTimesheets = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load pending timesheets.';
        this.loading = false;
      }
    });
  }

  approveTimesheet(id: number) {
    if (!confirm('Are you sure you want to approve this timesheet?')) return;

    this.loading = true;
    this.timesheetService.approveTimesheet(id).subscribe({
      next: () => {
        this.success = 'Timesheet approved successfully.';
        this.loading = false;
        this.fetchPendingTimesheets();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to approve timesheet.';
        this.loading = false;
      }
    });
  }

  openRejectModal(id: number) {
    this.selectedTimesheetId = id;
    this.rejectionComments = '';
    this.showRejectModal = true;
  }

  closeRejectModal() {
    this.showRejectModal = false;
    this.selectedTimesheetId = null;
    this.rejectionComments = '';
  }

  submitReject() {
    if (!this.rejectionComments.trim()) {
      this.error = 'Rejection comments are mandatory.';
      return;
    }

    if (!this.selectedTimesheetId) return;

    this.rejectLoading = true;
    this.timesheetService.rejectTimesheet(this.selectedTimesheetId, this.rejectionComments).subscribe({
      next: () => {
        this.success = 'Timesheet rejected with comments.';
        this.rejectLoading = false;
        this.closeRejectModal();
        this.fetchPendingTimesheets();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to reject timesheet.';
        this.rejectLoading = false;
      }
    });
  }
}
