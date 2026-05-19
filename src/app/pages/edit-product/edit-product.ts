import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { FormGroup,FormBuilder,Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ActivatedRoute,Router } from '@angular/router';
import { ProductForm } from '../../components/product-form/product-form';




@Component({
  selector: 'app-edit-product',
  imports: [ProductForm],
  templateUrl: './edit-product.html',
  styleUrl: './edit-product.css',
})


export class EditProduct implements OnInit {
    private fb = inject(FormBuilder)
    product!: Product;
    isLoading = false;
    productId! : number;
    successMessage: string | null = null;
    errorMessage: string | null = null;
    isSubmitting = false;

    constructor(
      private productService: ProductService,
      private route: ActivatedRoute,
      private cdr: ChangeDetectorRef,
      private router: Router
    ) {}

    productForm: FormGroup = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      category: ['', [Validators.required, Validators.maxLength(100)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      isAvailable: [true]
    });
    ngOnInit(): void {
        this.productId = Number(this.route.snapshot.paramMap.get('id'));
        this.loadProduct(this.productId);
      }
    
    loadProduct(id: number): void {
      this.isLoading = true;
      this.errorMessage = '';
      this.productService.getProductById(id).subscribe({
        next: (response) => {
          this.product = response;
          this.isLoading = false;
          this.cdr.markForCheck();
          this.productForm.patchValue(response);
    
        },
        error: () => {
          this.errorMessage = 'Failed to load product. Please try again later.';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
    }
    

    onSubmit(): void {
    this.productForm.markAllAsTouched();

    if (this.productForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.successMessage = null;
    this.errorMessage = null;

    this.productService.updateProduct(this.productId, this.productForm.value).subscribe({
      next: () => {
        this.successMessage = 'Product updated successfully.';
        this.router.navigate(['/products']);
      },
      error: () => {
        this.errorMessage = 'Failed to update product. Please try again.';
        this.isSubmitting = false;
        this.cdr.markForCheck();
      },
    });

  }
}
