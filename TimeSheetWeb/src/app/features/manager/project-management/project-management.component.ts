import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';

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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './project-management.component.html',
  styleUrl: './project-management.component.scss'
})
export class ProjectManagementComponent implements OnInit {
  projectForm!: FormGroup;
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  loading = false;
  error: string | null = null;
  showForm = false;
  isEditMode = false;
  searchTerm = '';
  filterActive = true;

  private editingProjectId: number | null = null;

  constructor(
    private projectService: ProjectService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
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
    this.loading = true;
    this.error = null;
    this.projectService.getAllProjects().subscribe({
      next: (data: Project[]) => {
        this.projects = data;
        this.applyFilters();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error loading projects:', err);
        this.error = `Failed to load projects: ${err.message || err.status || 'Unknown error'}`;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  openCreateForm(): void {
    this.showForm = true;
    this.isEditMode = false;
    this.editingProjectId = null;
    this.projectForm.reset({ isActive: true, isBillable: false });
    this.projectForm.get('projectCode')?.enable();
  }

  closeForm(): void {
    this.showForm = false;
    this.projectForm.reset();
  }

  editProject(project: Project): void {
    this.showForm = true;
    this.isEditMode = true;
    this.editingProjectId = project.id || null;
    this.projectForm.patchValue(project);
    this.projectForm.get('projectCode')?.disable();
  }

  onSubmit(): void {
    if (!this.projectForm.valid) return;

    if (this.isEditMode && this.editingProjectId) {
      this.updateProject();
    } else {
      this.createProject();
    }
  }

  createProject(): void {
    const formValue = this.projectForm.value;
    this.projectService.createProject(formValue).subscribe({
      next: (newProject) => {
        this.projects.push(newProject);
        this.applyFilters();
        this.closeForm();
      },
      error: (err) => {
        this.error = 'Failed to create project. Please try again.';
        console.error('Error creating project:', err);
      }
    });
  }

  updateProject(): void {
    if (!this.editingProjectId) return;

    const formValue = this.projectForm.getRawValue();
    this.projectService.updateProject(this.editingProjectId, formValue).subscribe({
      next: (updatedProject) => {
        const index = this.projects.findIndex(p => p.id === this.editingProjectId);
        if (index !== -1) {
          this.projects[index] = updatedProject;
        }
        this.applyFilters();
        this.closeForm();
      },
      error: (err) => {
        this.error = 'Failed to update project. Please try again.';
        console.error('Error updating project:', err);
      }
    });
  }

  toggleProjectStatus(project: Project): void {
    const updatedProject = { ...project, isActive: !project.isActive };
    this.projectService.updateProject(project.id || 0, updatedProject).subscribe({
      next: (result) => {
        const index = this.projects.findIndex(p => p.id === project.id);
        if (index !== -1) {
          this.projects[index] = result;
        }
        this.applyFilters();
      },
      error: (err) => {
        this.error = 'Failed to toggle project status. Please try again.';
        console.error('Error toggling project status:', err);
      }
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  onFilterChange(value: boolean): void {
    this.filterActive = value;
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredProjects = this.projects.filter(project => {
      const matchesSearch = project.projectCode.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        project.projectName.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesActiveFilter = !this.filterActive || project.isActive;
      console.log(matchesSearch, matchesActiveFilter);
      return matchesSearch && matchesActiveFilter;
    });
  }
}
