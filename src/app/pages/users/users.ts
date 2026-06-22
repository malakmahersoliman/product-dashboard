import { Component, OnInit, computed, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { UserTable } from '../../components/user-table/user-table';
import { ListFilterPanel } from '../../components/list-filter-panel/list-filter-panel';
import {
  FilterValues,
  ListFilterField,
  ListFilterSearchEvent,
} from '../../components/list-filter-panel/list-filter-panel.model';

@Component({
  selector: 'app-users',
  imports: [CommonModule, RouterLink, UserTable, ListFilterPanel],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  @ViewChild(ListFilterPanel) filterPanel?: ListFilterPanel;

  private readonly userService = inject(UserService);

  users = signal<User[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  appliedSearchTerm = signal('');

  readonly defaultUserFilterValues: FilterValues = {
    search: '',
  };

  readonly userFilterFields: ListFilterField[] = [
    {
      key: 'search',
      type: 'search',
      label: 'Search',
      chipLabel: 'Search',
      placeholder: 'User #, email, or role...',
      ariaLabel: 'Search users',
    },
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load users.');
        this.isLoading.set(false);
      },
    });
  }

  onFilterSearch(event: ListFilterSearchEvent): void {
    this.appliedSearchTerm.set(String(event.values['search'] ?? '').trim());
  }

  clearFilters(): void {
    this.filterPanel?.onReset();
  }

  deleteUser(id: number): void {
    const confirmed = confirm('Are you sure you want to delete this user?');

    if (!confirmed) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.successMessage.set('User deleted successfully.');
        this.loadUsers();
      },
      error: (error) => {
        if (error.status === 409) {
          this.errorMessage.set(
            'This user cannot be deleted because they are linked to existing orders.'
          );
        } else {
          this.errorMessage.set('Failed to delete user.');
        }
      },
    });
  }

  filteredUsers = computed(() => {
    const term = this.appliedSearchTerm().toLowerCase();

    if (!term) {
      return this.users();
    }

    return this.users().filter(
      (user) =>
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term) ||
        user.id.toString().includes(term)
    );
  });

  totalUsersCount = computed(() => this.users().length);

  superAdminCount = computed(
    () => this.users().filter((user) => user.role === 'SuperAdmin').length
  );

  regularUserCount = computed(
    () => this.users().filter((user) => user.role === 'User').length
  );
}
