import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ProductForm } from '../../components/product-form/product-form';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-edit-product',
  imports: [ProductForm, RouterLink],
  templateUrl: './edit-product.html',
  styleUrl: './edit-product.css',
})
export class EditProduct implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);

  product!: Product;
  productId!: number;

  categories: Category[] = [];
  categoriesLoading = false;
  categoriesError = '';

  isLoading = false;
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
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));

    this.loadCategories();
    this.loadProduct(this.productId);
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

  loadProduct(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getProductById(id).subscribe({
      next: product => {
        this.product = product;

        this.productForm.patchValue({
          name: product.name,
          categoryId: product.categoryId,
          price: product.price,
          stock: product.stock,
          isAvailable: product.isAvailable,
        });

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to load product. Please try again later.';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onSubmit(): void {
    this.productForm.markAllAsTouched();

    if (this.productForm.invalid) {
      return;
    }

    const formValue = this.productForm.getRawValue();

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

    this.productService
      .updateProduct(this.productId, request)
      .subscribe({
        next: () => {
          this.successMessage = 'Product updated successfully.';
          this.router.navigate(['/products']);
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMessage = 'Failed to update product. Please try again.';
          this.isSubmitting = false;
          this.cdr.markForCheck();
        },
      });
  }
}