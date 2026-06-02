import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ProductForm } from '../../components/product-form/product-form';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-add-product',
  imports: [ProductForm, RouterLink],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly cdr = inject(ChangeDetectorRef);

  categories: Category[] = [];
  categoriesLoading = false;
  categoriesError = '';

  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  productForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    categoryId: [null, Validators.required],
    price: ['', [Validators.required, Validators.min(0.01)]],
    stock: ['', [Validators.required, Validators.min(0)]],
    isAvailable: [true],
  });

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoriesLoading = true;
    this.categoriesError = '';
    this.cdr.markForCheck();

    this.categoryService.getCategories().subscribe({
      next: categories => {
        this.categories = categories;
        this.categoriesLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.categoriesError = 'Unable to load categories.';
        this.categoriesLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onSubmit(): void {
    this.productForm.markAllAsTouched();

    if (this.productForm.invalid) {
      return;
    }

    const formValue = this.productForm.value;

    const request = {
      name: formValue.name,
      categoryId: Number(formValue.categoryId),
      price: Number(formValue.price),
      stock: Number(formValue.stock),
      isAvailable: Boolean(formValue.isAvailable),
    };

    this.isSubmitting = true;
    this.successMessage = null;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.productService.createProduct(request).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.productForm.reset({
          name: '',
          categoryId: null,
          price: '',
          stock: '',
          isAvailable: true,
        });

        this.productService.clearCache();
        this.router.navigate(['/products']);
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to add product. Please try again.';
        this.isSubmitting = false;
        this.cdr.markForCheck();
      },
    });
  }
}