import { Component, OnInit ,  ChangeDetectorRef} from '@angular/core';
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
    errorMessage = '';
  constructor(
    private productService: ProductService,
     private cdr: ChangeDetectorRef

  )
   {}

    ngOnInit(): void {
        this.loadProduct();
    }
    loadProduct() : void {
      this.isLoading = true;
      this.errorMessage='';

      this.productService.getProductsFromApi().subscribe({

      next: (response) => {

          console.log('Success:', response);
          console.log('Products:', response.products);
          this.products = response.products;
          this.isLoading = false;
          this.cdr.markForCheck();
          console.log('isLoading:', this.isLoading);
          console.log('products length:', this.products.length);
                
        },
        error: (error) => {
          this.errorMessage = 'Failed to load data. please try again later.';
          this.isLoading = false;
          this.cdr.markForCheck();
          console.error(error);
        }
       });
    }
}
