import { Component, OnInit, inject, signal } from '@angular/core';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class UsersComponent implements OnInit {
  private readonly userService = inject(UserService);

  users = signal<User[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

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
}