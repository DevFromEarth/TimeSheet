import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ProjectAssignmentService } from '../../../core/services/project-assignment.service';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectAssignment, CreateProjectAssignmentDto, UpdateProjectAssignmentDto } from '../../../core/models/project-assignment.model';
import { Project } from '../../../core/models/project.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-assignment-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './assignment-management.component.html',
  styleUrl: './assignment-management.component.scss'
})
export class AssignmentManagementComponent implements OnInit, OnDestroy {
  assignments: ProjectAssignment[] = [];
  projects: Project[] = [];
  employees: User[] = [];
  filteredEmployees: User[] = [];

  assignmentForm: FormGroup;
  isEditMode = false;
  selectedAssignmentId: number | null = null;
  currentUser: User | null = null;

  showForm = false;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private assignmentService: ProjectAssignmentService,
    private projectService: ProjectService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.assignmentForm = this.fb.group({
      userId: ['', Validators.required],
      projectId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadProjects();
    this.loadEmployees();
    this.loadAssignments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  private loadProjects(): void {
    this.isLoading = true;
    this.projectService.getProjects(true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.projects = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load projects';
          console.error(err);
          this.isLoading = false;
        }
      });
  }

  private loadEmployees(): void {
    // Mock employee data - In production, create a user service to fetch employees
    this.employees = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Employee', isActive: true },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Employee', isActive: true },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Employee', isActive: true },
      { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Employee', isActive: true }
    ];
    this.filteredEmployees = this.employees;
  }

  private loadAssignments(): void {
    this.isLoading = true;
    // Load all project assignments or filtered based on context
    if (this.currentUser) {
      // For now, load a default set - in production, you might want to filter
      this.assignmentService.getProjectAssignments(1)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.assignments = data;
            this.isLoading = false;
          },
          error: (err) => {
            this.errorMessage = 'Failed to load assignments';
            console.error(err);
            this.isLoading = false;
          }
        });
    }
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  onSubmit(): void {
    if (this.assignmentForm.invalid) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formData = this.assignmentForm.value;

    if (this.isEditMode && this.selectedAssignmentId) {
      const updateDto: UpdateProjectAssignmentDto = {
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        isActive: formData.isActive
      };

      this.assignmentService.updateAssignment(this.selectedAssignmentId, updateDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = 'Assignment updated successfully';
            this.loadAssignments();
            this.resetForm();
            this.showForm = false;
            this.isLoading = false;
          },
          error: (err) => {
            this.errorMessage = err.error?.message || 'Failed to update assignment';
            console.error(err);
            this.isLoading = false;
          }
        });
    } else {
      const createDto: CreateProjectAssignmentDto = {
        userId: formData.userId,
        projectId: formData.projectId,
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined
      };

      this.assignmentService.createAssignment(createDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = 'Assignment created successfully';
            this.loadAssignments();
            this.resetForm();
            this.showForm = false;
            this.isLoading = false;
          },
          error: (err) => {
            this.errorMessage = err.error?.message || 'Failed to create assignment';
            console.error(err);
            this.isLoading = false;
          }
        });
    }
  }

  editAssignment(assignment: ProjectAssignment): void {
    this.isEditMode = true;
    this.selectedAssignmentId = assignment.id;
    this.showForm = true;

    this.assignmentForm.patchValue({
      userId: assignment.userId,
      projectId: assignment.projectId,
      startDate: this.formatDateForInput(assignment.startDate),
      endDate: assignment.endDate ? this.formatDateForInput(assignment.endDate) : '',
      isActive: assignment.isActive
    });

    // Disable userId and projectId in edit mode
    this.assignmentForm.get('userId')?.disable();
    this.assignmentForm.get('projectId')?.disable();
  }

  deleteAssignment(): void {
    if (this.selectedAssignmentId && confirm('Are you sure you want to delete this assignment?')) {
      this.isLoading = true;
      this.assignmentService.deleteAssignment(this.selectedAssignmentId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = 'Assignment deleted successfully';
            this.loadAssignments();
            this.resetForm();
            this.showForm = false;
            this.isLoading = false;
          },
          error: (err) => {
            this.errorMessage = err.error?.message || 'Failed to delete assignment';
            console.error(err);
            this.isLoading = false;
          }
        });
    }
  }

  resetForm(): void {
    this.assignmentForm.reset({ isActive: true });
    this.assignmentForm.get('userId')?.enable();
    this.assignmentForm.get('projectId')?.enable();
    this.isEditMode = false;
    this.selectedAssignmentId = null;
    this.errorMessage = null;
    this.successMessage = null;
  }

  getEmployeeName(userId: number): string {
    const employee = this.employees.find(e => e.id === userId);
    return employee ? employee.name : 'Unknown';
  }

  getProjectName(projectId: number): string {
    const project = this.projects.find(p => p.id === projectId);
    return project ? project.projectName : 'Unknown';
  }

  private formatDateForInput(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  isDateExpired(endDate: Date | undefined): boolean {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  }
}
