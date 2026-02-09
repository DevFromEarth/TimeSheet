import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectAssignmentService } from '../../../core/services/project-assignment.service';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ProjectAssignment, CreateProjectAssignmentDto, UpdateProjectAssignmentDto } from '../../../core/models/project-assignment.model';
import { Project } from '../../../core/models/project.model';
import { User } from '../../../core/models/user.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-assignment-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoaderComponent],
  templateUrl: './assignment-management.component.html',
  styleUrl: './assignment-management.component.scss'
})
export class AssignmentManagementComponent implements OnInit {
  assignmentForm: FormGroup;

  // Signals for state management
  assignments = signal<ProjectAssignment[]>([]);
  projects = signal<Project[]>([]);
  employees = signal<User[]>([]);
  filteredEmployees = computed(() => this.employees());
  currentUser = signal<User | null>(null);

  showForm = signal(false);
  isEditMode = signal(false);
  selectedAssignmentId = signal<number | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor(
    private assignmentService: ProjectAssignmentService,
    private projectService: ProjectService,
    private authService: AuthService,
    private userService: UserService,
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

  private loadCurrentUser(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser.set(user);
    });
  }

  private loadProjects(): void {
    this.isLoading.set(true);
    this.projectService.getProjects(true).subscribe({
      next: (data) => {
        this.projects.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Failed to load projects');
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  private loadEmployees(): void {
    this.isLoading.set(true);
    this.userService.getActiveEmployees().subscribe({
      next: (data) => {
        this.employees.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Failed to load employees');
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  private loadAssignments(): void {
    this.isLoading.set(true);
    if (this.currentUser()) {
      this.assignmentService.getProjectAssignments().subscribe({
        next: (data) => {
          this.assignments.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set('Failed to load assignments');
          console.error(err);
          this.isLoading.set(false);
        }
      });
    }
  }

  toggleForm(): void {
    this.showForm.update(value => !value);
    if (!this.showForm()) {
      this.resetForm();
    }
  }

  onSubmit(): void {
    if (this.assignmentForm.invalid) {
      this.errorMessage.set('Please fill in all required fields');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formData = this.assignmentForm.value;

    if (this.isEditMode() && this.selectedAssignmentId()) {
      const updateDto: UpdateProjectAssignmentDto = {
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        isActive: formData.isActive
      };

      this.assignmentService.updateAssignment(this.selectedAssignmentId()!, updateDto)
        .subscribe({
          next: () => {
            this.successMessage.set('Assignment updated successfully');
            this.loadAssignments();
            this.resetForm();
            this.showForm.set(false);
            this.isLoading.set(false);
          },
          error: (err) => {
            this.errorMessage.set(err.error?.message || 'Failed to update assignment');
            console.error(err);
            this.isLoading.set(false);
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
        .subscribe({
          next: () => {
            this.successMessage.set('Assignment created successfully');
            this.loadAssignments();
            this.resetForm();
            this.showForm.set(false);
            this.isLoading.set(false);
          },
          error: (err) => {
            this.errorMessage.set(err.error?.message || 'Failed to create assignment');
            console.error(err);
            this.isLoading.set(false);
          }
        });
    }
  }

  editAssignment(assignment: ProjectAssignment): void {
    this.isEditMode.set(true);
    this.selectedAssignmentId.set(assignment.id);
    this.showForm.set(true);

    this.assignmentForm.patchValue({
      userId: assignment.userId,
      projectId: assignment.projectId,
      startDate: this.formatDateForInput(assignment.startDate),
      endDate: assignment.endDate ? this.formatDateForInput(assignment.endDate) : '',
      isActive: assignment.isActive
    });

    this.assignmentForm.get('userId')?.disable();
    this.assignmentForm.get('projectId')?.disable();
  }

  deleteAssignment(): void {
    if (this.selectedAssignmentId() && confirm('Are you sure you want to delete this assignment?')) {
      this.isLoading.set(true);
      this.assignmentService.deleteAssignment(this.selectedAssignmentId()!)
        .subscribe({
          next: () => {
            this.successMessage.set('Assignment deleted successfully');
            this.loadAssignments();
            this.resetForm();
            this.showForm.set(false);
            this.isLoading.set(false);
          },
          error: (err) => {
            this.errorMessage.set(err.error?.message || 'Failed to delete assignment');
            console.error(err);
            this.isLoading.set(false);
          }
        });
    }
  }

  resetForm(): void {
    this.assignmentForm.reset({ isActive: true });
    this.assignmentForm.get('userId')?.enable();
    this.assignmentForm.get('projectId')?.enable();
    this.isEditMode.set(false);
    this.selectedAssignmentId.set(null);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  getEmployeeName(userId: number): string {
    const employee = this.employees().find(e => e.id === userId);
    return employee ? employee.name : 'Unknown';
  }

  getProjectName(projectId: number): string {
    const project = this.projects().find(p => p.id === projectId);
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
