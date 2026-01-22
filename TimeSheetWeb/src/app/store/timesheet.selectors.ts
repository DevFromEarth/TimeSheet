import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TimesheetState, selectAll } from './timesheet.reducer';

export const selectTimesheetState = createFeatureSelector<TimesheetState>('timesheets');

export const selectAllTimesheets = createSelector(
  selectTimesheetState,
  selectAll
);

export const selectTimesheetLoading = createSelector(
  selectTimesheetState,
  (state: TimesheetState) => state.loading
);

export const selectTimesheetError = createSelector(
  selectTimesheetState,
  (state: TimesheetState) => state.error
);

export const selectDraftTimesheets = createSelector(
  selectAllTimesheets,
  timesheets => timesheets.filter(t => t.status === 'Draft')
);

export const selectSubmittedTimesheets = createSelector(
  selectAllTimesheets,
  timesheets => timesheets.filter(t => t.status === 'Submitted')
);

export const selectApprovedTimesheets = createSelector(
  selectAllTimesheets,
  timesheets => timesheets.filter(t => t.status === 'Approved')
);

export const selectRejectedTimesheets = createSelector(
  selectAllTimesheets,
  timesheets => timesheets.filter(t => t.status === 'Rejected')
);
