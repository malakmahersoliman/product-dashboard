import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { UserTable } from '../../components/user-table/user-table';

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule, RouterLink, UserTable],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  private readonly userService = inject(UserService);

  users = signal<User[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  searchTerm = signal('');

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

  onSearchChanged(value: string): void {
    this.searchTerm.set(value);
  }

  filteredUsers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

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
