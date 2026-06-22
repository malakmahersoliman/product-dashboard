import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Category, CategoryRequest } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { ListFilterPanel } from '../../components/list-filter-panel/list-filter-panel';
import {
  FilterValues,
  ListFilterField,
  ListFilterSearchEvent,
} from '../../components/list-filter-panel/list-filter-panel.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ListFilterPanel],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {
  @ViewChild(ListFilterPanel) filterPanel?: ListFilterPanel;

  private readonly categoryService = inject(CategoryService);
  private readonly cdr = inject(ChangeDetectorRef);

  categories: Category[] = [];
  appliedSearchTerm = '';

  isLoading = false;
  isSaving = false;
  formOpen = false;
  errorMessage = '';
  successMessage = '';

  editingCategoryId: number | null = null;

  readonly defaultCategoryFilterValues: FilterValues = {
    search: '',
  };

  readonly categoryFilterFields: ListFilterField[] = [
    {
      key: 'search',
      type: 'search',
      label: 'Search',
      chipLabel: 'Search',
      placeholder: 'Name or description...',
      ariaLabel: 'Search categories',
    },
  ];

  form: CategoryRequest = {
    name: '',
    description: '',
  };

  ngOnInit(): void {
    this.loadCategories();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.formOpen && !this.isSaving) {
      this.closeForm();
    }
  }

  get filteredCategories(): Category[] {
    const term = this.appliedSearchTerm.trim().toLowerCase();

    if (!term) {
      return this.categories;
    }

    return this.categories.filter(
      (category) =>
        category.name.toLowerCase().includes(term) ||
        (category.description ?? '').toLowerCase().includes(term)
    );
  }

  onFilterSearch(event: ListFilterSearchEvent): void {
    this.appliedSearchTerm = String(event.values['search'] ?? '').trim();
    this.cdr.markForCheck();
  }

  clearFilters(): void {
    this.filterPanel?.onReset();
  }

  get isEditing(): boolean {
    return this.editingCategoryId !== null;
  }

  loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Unable to load categories. Please try again.';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  openCreateForm(): void {
    this.editingCategoryId = null;
    this.form = {
      name: '',
      description: '',
    };
    this.errorMessage = '';
    this.formOpen = true;
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    const request = this.buildRequest();

    if (!request.name) {
      this.errorMessage = 'Category name is required.';
      return;
    }

    if (this.isEditing && this.editingCategoryId !== null) {
      this.updateCategory(this.editingCategoryId, request);
      return;
    }

    this.createCategory(request);
  }

  startEdit(category: Category): void {
    this.editingCategoryId = category.id;
    this.form = {
      name: category.name,
      description: category.description ?? '',
    };

    this.errorMessage = '';
    this.formOpen = true;
    this.cdr.markForCheck();
  }

  closeForm(): void {
    if (this.isSaving) {
      return;
    }

    this.resetForm();
  }

  onDelete(category: Category): void {
    const confirmed = confirm(`Delete category "${category.name}"?`);

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => {
        this.categories = this.categories.filter((c) => c.id !== category.id);
        this.successMessage = 'Category deleted successfully.';

        if (this.editingCategoryId === category.id) {
          this.resetForm(false);
        }

        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Unable to delete category. Please try again.';
        this.cdr.markForCheck();
      },
    });
  }

  private createCategory(request: CategoryRequest): void {
    this.isSaving = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.categoryService.createCategory(request).subscribe({
      next: (category) => {
        this.categories = [...this.categories, category].sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        this.successMessage = 'Category created successfully.';
        this.isSaving = false;
        this.resetForm(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Unable to create category. The name may already exist.';
        this.isSaving = false;
        this.cdr.markForCheck();
      },
    });
  }

  private updateCategory(id: number, request: CategoryRequest): void {
    this.isSaving = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.categoryService.updateCategory(id, request).subscribe({
      next: (updatedCategory) => {
        this.categories = this.categories
          .map((category) =>
            category.id === updatedCategory.id ? updatedCategory : category
          )
          .sort((a, b) => a.name.localeCompare(b.name));

        this.successMessage = 'Category updated successfully.';
        this.isSaving = false;
        this.resetForm(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Unable to update category. The name may already exist.';
        this.isSaving = false;
        this.cdr.markForCheck();
      },
    });
  }

  private buildRequest(): CategoryRequest {
    return {
      name: this.form.name.trim(),
      description: this.form.description?.trim() || null,
    };
  }

  private resetForm(clearMessages = true): void {
    this.editingCategoryId = null;
    this.formOpen = false;
    this.form = {
      name: '',
      description: '',
    };
    this.isSaving = false;

    if (clearMessages) {
      this.errorMessage = '';
      this.successMessage = '';
    }

    this.cdr.markForCheck();
  }
}
