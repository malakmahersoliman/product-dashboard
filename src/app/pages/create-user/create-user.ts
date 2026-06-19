import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { UserForm } from '../../components/user-form/user-form';
import { CreateUserRequest } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-create-user',
  imports: [RouterLink, UserForm],
  templateUrl: './create-user.html',
  styleUrl: './create-user.css',
})
export class CreateUser {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit(request: CreateUserRequest): void {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.userService.createUser(request).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.isSubmitting.set(false);

        if (error.status === 409) {
          this.errorMessage.set('A user with this email already exists.');
        } else {
          this.errorMessage.set('Failed to create user. Please try again.');
        }
      },
    });
  }
}
