import { Component, inject } from '@angular/core';
import {  FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ProductForm } from '../../components/product-form/product-form';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-add-product',
  imports: [ProductForm,RouterLink],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct {
  private fb = inject(FormBuilder);
  constructor(    
    private productService: ProductService,
    private router: Router
  )
  {}
   isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

    productForm: FormGroup = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      category: ['', [Validators.required, Validators.maxLength(100)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      isAvailable: [true]
    });
  onSubmit(): void {
    this.productForm.markAllAsTouched();

    if (this.productForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.successMessage = null;
    this.errorMessage = null;

    this.productService.createProduct(this.productForm.value).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.productForm.reset({ isAvailable: true });
        this.productService.clearCache();
        this.router.navigate(['/products']);

      },
      error: () => {
        this.errorMessage = 'Failed to add product. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}
