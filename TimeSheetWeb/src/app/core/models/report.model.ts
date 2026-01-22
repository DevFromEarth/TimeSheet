export interface EmployeeHoursSummary {
  userId: number;
  userName: string;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
}

export interface ProjectHoursSummary {
  projectId: number;
  projectCode: string;
  projectName: string;
  clientName: string;
  isBillable: boolean;
  totalHours: number;
}

export interface BillableSummary {
  totalBillableHours: number;
  totalNonBillableHours: number;
  totalHours: number;
  billablePercentage: number;
}

export interface ReportFilter {
  startDate: Date;
  endDate: Date;
  userId?: number;
  projectId?: number;
}
