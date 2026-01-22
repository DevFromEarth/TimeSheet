import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, mergeMap } from 'rxjs/operators';
import { TimesheetService } from '../core/services/timesheet.service';
import * as TimesheetActions from './timesheet.actions';

@Injectable()
export class TimesheetEffects {
  private actions$ = inject(Actions);
  private timesheetService = inject(TimesheetService);

  loadTimesheets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TimesheetActions.loadTimesheets),
      switchMap(({ userId }) =>
        this.timesheetService.getUserTimesheets(userId).pipe(
          map(timesheets =>
            TimesheetActions.loadTimesheetsSuccess({ timesheets })
          ),
          catchError(error =>
            of(TimesheetActions.loadTimesheetsFailure({ error }))
          )
        )
      )
    )
  );

  createTimesheet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TimesheetActions.createTimesheet),
      mergeMap(({ timesheet }) =>
        this.timesheetService.createTimesheet(timesheet).pipe(
          map(createdTimesheet =>
            TimesheetActions.createTimesheetSuccess({ timesheet: createdTimesheet })
          ),
          catchError(error =>
            of(TimesheetActions.createTimesheetFailure({ error }))
          )
        )
      )
    )
  );

  updateTimesheet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TimesheetActions.updateTimesheet),
      mergeMap(({ id, timesheet }) =>
        this.timesheetService.updateTimesheet(id, timesheet).pipe(
          map(updatedTimesheet =>
            TimesheetActions.updateTimesheetSuccess({ timesheet: updatedTimesheet })
          ),
          catchError(error =>
            of(TimesheetActions.updateTimesheetFailure({ error }))
          )
        )
      )
    )
  );

  deleteTimesheet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TimesheetActions.deleteTimesheet),
      mergeMap(({ id }) =>
        this.timesheetService.deleteTimesheet(id).pipe(
          map(() =>
            TimesheetActions.deleteTimesheetSuccess({ id })
          ),
          catchError(error =>
            of(TimesheetActions.deleteTimesheetFailure({ error }))
          )
        )
      )
    )
  );

  submitTimesheets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TimesheetActions.submitTimesheets),
      mergeMap(({ timesheetIds }) =>
        this.timesheetService.submitTimesheets({ timesheetIds }).pipe(
          map(() =>
            TimesheetActions.submitTimesheetsSuccess()
          ),
          catchError(error =>
            of(TimesheetActions.submitTimesheetsFailure({ error }))
          )
        )
      )
    )
  );
}

