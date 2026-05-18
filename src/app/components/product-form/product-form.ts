import { Component , Input, Output, EventEmitter} from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm {
  @Input() productForm!: FormGroup;
  @Input() isSubmitting: boolean = false;
  @Input() buttonText: string = 'Submit';

  @Output() formSubmit = new EventEmitter<void>();

  onSubmit() {
    this.formSubmit.emit();
  }
}
