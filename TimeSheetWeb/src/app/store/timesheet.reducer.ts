import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Timesheet } from '../core/models/timesheet.model';
import * as TimesheetActions from './timesheet.actions';

export interface TimesheetState extends EntityState<Timesheet> {
  loading: boolean;
  error: any;
}

export const adapter: EntityAdapter<Timesheet> = createEntityAdapter<Timesheet>();

export const initialState: TimesheetState = adapter.getInitialState({
  loading: false,
  error: null
});

export const timesheetReducer = createReducer(
  initialState,
  on(TimesheetActions.loadTimesheets, state => ({
    ...state,
    loading: true
  })),
  on(TimesheetActions.loadTimesheetsSuccess, (state, { timesheets }) =>
    adapter.setAll(timesheets, { ...state, loading: false })
  ),
  on(TimesheetActions.loadTimesheetsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(TimesheetActions.createTimesheetSuccess, (state, { timesheet }) =>
    adapter.addOne(timesheet, state)
  ),
  on(TimesheetActions.updateTimesheetSuccess, (state, { timesheet }) =>
    adapter.updateOne({ id: timesheet.id, changes: timesheet }, state)
  ),
  on(TimesheetActions.deleteTimesheetSuccess, (state, { id }) =>
    adapter.removeOne(id, state)
  )
);

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal
} = adapter.getSelectors();
