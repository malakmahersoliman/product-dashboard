import { Component ,inject } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { FormBuilder , FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-add-customer',
  imports: [ReactiveFormsModule,RouterLink],
  providers: [CustomerService],
  templateUrl: './add-customer.html',
  styleUrl: './add-customer.css',
})
export class AddCustomer {
  private fb = inject(FormBuilder);
  customerService = inject(CustomerService);
  router = inject( Router);

  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

   customerForm: FormGroup = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      email: ['', [Validators.required, Validators.email]],
    });
  onSubmit(): void {
    this.customerForm.markAllAsTouched();

    if (this.customerForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.successMessage = null;
    this.errorMessage = null;

    this.customerService.createCustomer(this.customerForm.value).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.customerForm.reset();
        this.router.navigate(['/customers']);

      },
      error: () => {
        this.errorMessage = 'Failed to add customer. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}
