export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Employee' | 'Manager';
  isActive: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
