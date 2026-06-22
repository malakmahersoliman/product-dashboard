import { Component, ChangeDetectorRef, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { UserService } from '../../services/user.service';
import { UpdateUserRequest, USER_ROLES, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-edit-user',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.css',
})
export class EditUser implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  userId!: number;

  isLoading = signal(false);
  isSubmitting = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  readonly roles = [
    { value: USER_ROLES.user, label: 'User' },
    { value: USER_ROLES.superAdmin, label: 'Super Admin' },
  ];

  userForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.minLength(6), Validators.maxLength(100)]],
    role: [USER_ROLES.user, Validators.required],
  });

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadUser();
  }

  loadUser(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.cdr.markForCheck();

    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          email: user.email,
          role: user.role,
        });

        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage.set('Failed to load user. Please try again.');
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  onSubmit(): void {
    this.userForm.markAllAsTouched();

    if (this.userForm.invalid) {
      return;
    }

    const request = this.buildRequest();

    this.isSubmitting.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.cdr.markForCheck();

    this.userService.updateUser(this.userId, request).subscribe({
      next: () => {
        this.successMessage.set('User updated successfully.');
        this.router.navigate(['/users']);
        this.cdr.markForCheck();
      },
      error: (error) => {
        if (error.status === 409) {
          this.errorMessage.set('A user with this email already exists.');
        } else {
          this.errorMessage.set('Failed to update user. Please try again.');
        }

        this.isSubmitting.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  private buildRequest(): UpdateUserRequest {
    const value = this.userForm.getRawValue();
    const password = value.password?.trim() ?? '';

    const request: UpdateUserRequest = {
      email: value.email?.trim() ?? '',
      role: (value.role ?? USER_ROLES.user) as UserRole,
    };

    if (password) {
      request.password = password;
    }

    return request;
  }
}
