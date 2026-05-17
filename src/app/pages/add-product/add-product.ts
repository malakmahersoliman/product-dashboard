import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-add-product',
  imports: [ReactiveFormsModule],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct {
  private fb = inject(FormBuilder);
  constructor(    
    private productService: ProductService
  )
  {}
   isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  productForm: FormGroup = this.fb.group({
   title: ['', [Validators.required, Validators.minLength(3)]],
   price:['', [Validators.required,Validators.min(1)]],
   category:['', Validators.required],
   description:['', [Validators.required,Validators.minLength(10)]],
   stock:['', [Validators.required,Validators.min(0)]],
   thumbnail: ['']
  });
  onSubmit() {
    this.productForm.markAllAsTouched();
    if (this.productForm.invalid) {
        return;
      }
    this.productService.addProduct(this.productForm.value).subscribe({
    next: (response) =>{
     this.successMessage=`Product "${response.title}" added successfully."`;
     this.isSubmitting= false;
     this.productForm.reset;
    },
    error: (error) =>{
     this.errorMessage = 'Faild to added product. Please try again.';
     this.isSubmitting = false;
     console.error(error);
    }
    });
  }
}
