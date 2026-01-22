export interface ProjectAssignment {
  id: number;
  userId: number;
  userName: string;
  projectId: number;
  projectCode: string;
  projectName: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface CreateProjectAssignmentDto {
  userId: number;
  projectId: number;
  startDate: Date;
  endDate?: Date;
}

export interface UpdateProjectAssignmentDto {
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}
