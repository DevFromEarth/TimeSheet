import { createAction, props } from '@ngrx/store';
import { Timesheet, CreateTimesheetDto, UpdateTimesheetDto } from '../core/models/timesheet.model';

// Load Timesheets
export const loadTimesheets = createAction(
  '[Timesheet] Load Timesheets',
  props<{ userId: number }>()
);

export const loadTimesheetsSuccess = createAction(
  '[Timesheet] Load Timesheets Success',
  props<{ timesheets: Timesheet[] }>()
);

export const loadTimesheetsFailure = createAction(
  '[Timesheet] Load Timesheets Failure',
  props<{ error: any }>()
);

// Create Timesheet
export const createTimesheet = createAction(
  '[Timesheet] Create Timesheet',
  props<{ timesheet: CreateTimesheetDto }>()
);

export const createTimesheetSuccess = createAction(
  '[Timesheet] Create Timesheet Success',
  props<{ timesheet: Timesheet }>()
);

export const createTimesheetFailure = createAction(
  '[Timesheet] Create Timesheet Failure',
  props<{ error: any }>()
);

// Update Timesheet
export const updateTimesheet = createAction(
  '[Timesheet] Update Timesheet',
  props<{ id: number; timesheet: UpdateTimesheetDto }>()
);

export const updateTimesheetSuccess = createAction(
  '[Timesheet] Update Timesheet Success',
  props<{ timesheet: Timesheet }>()
);

export const updateTimesheetFailure = createAction(
  '[Timesheet] Update Timesheet Failure',
  props<{ error: any }>()
);

// Delete Timesheet
export const deleteTimesheet = createAction(
  '[Timesheet] Delete Timesheet',
  props<{ id: number }>()
);

export const deleteTimesheetSuccess = createAction(
  '[Timesheet] Delete Timesheet Success',
  props<{ id: number }>()
);

export const deleteTimesheetFailure = createAction(
  '[Timesheet] Delete Timesheet Failure',
  props<{ error: any }>()
);

// Submit Timesheets
export const submitTimesheets = createAction(
  '[Timesheet] Submit Timesheets',
  props<{ timesheetIds: number[] }>()
);

export const submitTimesheetsSuccess = createAction(
  '[Timesheet] Submit Timesheets Success'
);

export const submitTimesheetsFailure = createAction(
  '[Timesheet] Submit Timesheets Failure',
  props<{ error: any }>()
);
