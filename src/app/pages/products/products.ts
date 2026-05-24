import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ProductCard } from '../../components/product-card/product-card';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-products',
  imports: [ProductCard, RouterLink, CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  products: Product[] = [];
  searchTerm = '';
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      if (params.get('orderPlaced') === 'true') {
        this.successMessage = 'Order placed successfully.';
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { orderPlaced: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
        this.cdr.markForCheck();
      }
    });

    this.loadProducts();
  }

  get filteredProducts(): Product[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.products;
    }

    return this.products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
    );
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getProducts().subscribe({
      next: (response) => {
        this.products = response;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to load products. Please try again later.';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
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
        this.productService.clearCache();
        this.products = this.products.filter((product) => product.id !== id);
        this.successMessage = 'Product deleted successfully.';
        this.cdr.markForCheck();
      },
      error: (error) => {
        if (error.status === 409) {
          this.errorMessage =
            'This product cannot be deleted because it is linked to existing orders.';
        } else {
          this.errorMessage = 'Failed to delete product. Please try again.';
        }
        this.cdr.markForCheck();
      },
    });
  }
}
