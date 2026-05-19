import { Component , OnInit , ChangeDetectorRef} from '@angular/core';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-product-details',
  imports: [],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})


export class ProductDetails implements OnInit {
  product: Product | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProduct(id);
  }

  loadProduct(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getProductById(id).subscribe({
      next: (response) => {
        this.product = response;
        this.isLoading = false;
        this.cdr.markForCheck();
  
      },
      error: () => {
        this.errorMessage = 'Failed to load product. Please try again later.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}