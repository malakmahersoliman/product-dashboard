import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CreateUserRequest, USER_ROLES, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm {
  private readonly fb = inject(FormBuilder);

  isSubmitting = input(false);
  errorMessage = input<string | null>(null);

  submitted = output<CreateUserRequest>();

  readonly roles = [
    { value: USER_ROLES.user, label: 'User' },
    { value: USER_ROLES.superAdmin, label: 'Super Admin' },
  ];

  userForm = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
    role: [USER_ROLES.user, Validators.required],
  });

  onSubmit(): void {
    this.userForm.markAllAsTouched();

    if (this.userForm.invalid) {
      return;
    }

    const formValue = this.userForm.getRawValue();

    this.submitted.emit({
      email: formValue.email?.trim() ?? '',
      password: formValue.password ?? '',
      role: (formValue.role ?? USER_ROLES.user) as UserRole,
    });
  }
}
