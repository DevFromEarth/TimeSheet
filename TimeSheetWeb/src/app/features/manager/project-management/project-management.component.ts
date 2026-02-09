import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

interface Project {
  id?: number;
  projectCode: string;
  projectName: string;
  clientName: string;
  isBillable: boolean;
  isActive: boolean;
  createdAt?: Date;
}

@Component({
  selector: 'app-project-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoaderComponent],
  templateUrl: './project-management.component.html',
  styleUrl: './project-management.component.scss'
})
export class ProjectManagementComponent implements OnInit {
  projectForm!: FormGroup;

  // Signals for state management
  projects = signal<Project[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  showForm = signal(false);
  isEditMode = signal(false);
  searchTerm = signal('');
  filterActive = signal(true);
  private editingProjectId = signal<number | null>(null);

  // Computed signal for filtered projects
  filteredProjects = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const active = this.filterActive();
    return this.projects().filter(project => {
      const matchesSearch =
        project.projectCode.toLowerCase().includes(term) ||
        project.projectName.toLowerCase().includes(term);
      const matchesActiveFilter = !active || project.isActive;
      return matchesSearch && matchesActiveFilter;
    });
  });

  constructor(
    private projectService: ProjectService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  private initializeForm(): void {
    this.projectForm = this.fb.group({
      projectCode: ['', [Validators.required]],
      projectName: ['', [Validators.required]],
      clientName: ['', [Validators.required]],
      isBillable: [false],
      isActive: [true]
    });
  }

  loadProjects(): void {
    this.loading.set(true);
    this.error.set(null);
    this.projectService.getAllProjects().subscribe({
      next: (data: Project[]) => {
        this.projects.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading projects:', err);
        this.error.set(`Failed to load projects: ${err.message || err.status || 'Unknown error'}`);
        this.loading.set(false);
      }
    });
  }

  openCreateForm(): void {
    this.showForm.set(true);
    this.isEditMode.set(false);
    this.editingProjectId.set(null);
    this.projectForm.reset({ isActive: true, isBillable: false });
    this.projectForm.get('projectCode')?.enable();
  }

  closeForm(): void {
    this.showForm.set(false);
    this.projectForm.reset();
  }

  editProject(project: Project): void {
    this.showForm.set(true);
    this.isEditMode.set(true);
    this.editingProjectId.set(project.id || null);
    this.projectForm.patchValue(project);
    this.projectForm.get('projectCode')?.disable();
  }

  onSubmit(): void {
    if (!this.projectForm.valid) return;

    if (this.isEditMode() && this.editingProjectId()) {
      this.updateProject();
    } else {
      this.createProject();
    }
  }

  createProject(): void {
    const formValue = this.projectForm.value;
    this.projectService.createProject(formValue).subscribe({
      next: (newProject) => {
        this.projects.update(projects => [...projects, newProject]);
        this.closeForm();
      },
      error: (err) => {
        this.error.set('Failed to create project. Please try again.');
        console.error('Error creating project:', err);
      }
    });
  }

  updateProject(): void {
    const id = this.editingProjectId();
    if (!id) return;

    const formValue = this.projectForm.getRawValue();
    this.projectService.updateProject(id, formValue).subscribe({
      next: (updatedProject) => {
        this.projects.update(projects =>
          projects.map(p => p.id === id ? updatedProject : p)
        );
        this.closeForm();
      },
      error: (err) => {
        this.error.set('Failed to update project. Please try again.');
        console.error('Error updating project:', err);
      }
    });
  }

  toggleProjectStatus(project: Project): void {
    const updatedProject = { ...project, isActive: !project.isActive };
    this.projectService.updateProject(project.id || 0, updatedProject).subscribe({
      next: (result) => {
        this.projects.update(projects =>
          projects.map(p => p.id === project.id ? result : p)
        );
      },
      error: (err) => {
        this.error.set('Failed to toggle project status. Please try again.');
        console.error('Error toggling project status:', err);
      }
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  onFilterChange(value: boolean): void {
    this.filterActive.set(value);
  }
}
