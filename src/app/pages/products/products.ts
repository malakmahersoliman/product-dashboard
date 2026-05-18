import { Component, OnInit , ChangeDetectorRef} from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ProductCard } from '../../components/product-card/product-card';

@Component({
  selector: 'app-products',
  imports: [ProductCard],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
    products: Product[] = [];
    isLoading = false;
    errorMessage:  string | null = null;
    successMessage: string | null = null;
  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  )
   {}

    ngOnInit(): void {
        this.loadProducts();
    }
    loadProducts() : void {
      this.isLoading = true;
      this.errorMessage='';

      this.productService.getProducts().subscribe({

      next: (response) => {

          console.log('Success:', response);
          console.log('Products:', response);
          this.products = response;
          this.isLoading = false;
          this.cdr.markForCheck();
          console.log('isLoading:', this.isLoading);
          console.log('products length:', this.products.length);
                
        },
        error: (error) => {
          console.log('API error:', error);
          this.errorMessage = 'Failed to load products. Please try again later.';
          this.isLoading = false;
          this.cdr.markForCheck();
          console.error(error);
        }
       });
    }
   onDeleteProduct(id: number): void {
  const confirmed = confirm('Are you sure you want to delete this product?');

  if (!confirmed) {
    return;
  }

  this.errorMessage = null;
  this.successMessage = null;

  this.productService.deleteProduct(id).subscribe({
    next: () => {
      this.products = this.products.filter(product => product.id !== id);
      this.successMessage = 'Product deleted successfully.';
      this.cdr.markForCheck();
    },
    error: (error) => {
      console.log('API error:', error);
      this.errorMessage = 'Failed to delete product.';
      this.cdr.markForCheck();
    }
  });
}
}
