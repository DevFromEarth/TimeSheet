export interface Timesheet {
  id: number;
  userId: number;
  userName: string;
  projectId: number;
  projectCode: string;
  projectName: string;
  date: Date;
  hoursWorked: number;
  description: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  rejectionComments?: string;
  createdAt: Date;
}

export interface CreateTimesheetDto {
  projectId: number;
  date: Date;
  hoursWorked: number;
  description: string;
}

export interface UpdateTimesheetDto {
  projectId: number;
  date: Date;
  hoursWorked: number;
  description: string;
}

export interface SubmitTimesheetDto {
  timesheetIds: number[];
}

export interface RejectTimesheetDto {
  timesheetId: number;
  rejectionComments: string;
}
