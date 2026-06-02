import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm {
  @Input() productForm!: FormGroup;
  @Input() isSubmitting = false;
  @Input() buttonText = 'Submit';
  

  //after adding categories we define it here 
  // so now we make it a dropdown to choice from it 
  @Input() categories: Category[] = [];
  @Input() categoriesLoading = false;
  @Input() categoriesError = '';

  @Output() formSubmit = new EventEmitter<void>();

  onSubmit(): void {
    this.formSubmit.emit();
  }
}