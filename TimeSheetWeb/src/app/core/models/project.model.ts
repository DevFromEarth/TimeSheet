export interface Project {
  id: number;
  projectCode: string;
  projectName: string;
  clientName: string;
  isBillable: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateProjectDto {
  projectCode: string;
  projectName: string;
  clientName: string;
  isBillable: boolean;
}

export interface UpdateProjectDto {
  projectName: string;
  clientName: string;
  isBillable: boolean;
  isActive: boolean;
}
