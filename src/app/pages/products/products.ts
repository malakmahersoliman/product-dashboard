import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ProductCard } from '../../components/product-card/product-card';
import { Pagination } from '../../components/pagination/pagination';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-products',
  imports: [ProductCard, Pagination, RouterLink, CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];

  isLoading = false;
  categoriesLoading = false;

  errorMessage: string | null = null;
  successMessage: string | null = null;
  categoriesError: string | null = null;

  searchTerm = '';
  selectedCategoryId: number | null = null;
  selectedAvailability: boolean | null = null;
  selectedStockStatus = '';

  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  sortBy = 'name';
  sortDirection = 'asc';

  authService = inject(AuthService);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly categoryService = inject(CategoryService);

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.handleOrderPlacedMessage();
    this.loadCategories();
    this.loadProducts();
  }

  handleOrderPlacedMessage(): void {
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
  }

  loadCategories(): void {
    this.categoriesLoading = true;
    this.categoriesError = null;
    this.cdr.markForCheck();

    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.categoriesLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.categoriesError = 'Failed to load categories.';
        this.categoriesLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.productService
      .getProducts({
        search: this.searchTerm,
        categoryId: this.selectedCategoryId,
        isAvailable: this.selectedAvailability,
        stockStatus: this.selectedStockStatus,
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        sortBy: this.sortBy,
        sortDirection: this.sortDirection,
      })
      .subscribe({
        next: (result) => {
          this.products = result.items;
          this.pageNumber = result.pageNumber;
          this.pageSize = result.pageSize;
          this.totalCount = result.totalCount;
          this.totalPages = result.totalPages;

          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMessage = 'Failed to load products.';
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onFiltersChanged(): void {
    this.pageNumber = 1;
    this.loadProducts();
  }

  onSearchChanged(): void {
    this.pageNumber = 1;
    this.loadProducts();
  }

  onPageSizeChanged(): void {
    this.pageNumber = 1;
    this.loadProducts();
  }

  onPageChange(pageNumber: number): void {
    this.pageNumber = pageNumber;
    this.loadProducts();
  }

  setSort(sortValue: string): void {
    const [sortBy, sortDirection] = sortValue.split(':');

    this.sortBy = sortBy;
    this.sortDirection = sortDirection;
    this.pageNumber = 1;

    this.loadProducts();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategoryId = null;
    this.selectedAvailability = null;
    this.selectedStockStatus = '';
    this.sortBy = 'name';
    this.sortDirection = 'asc';
    this.pageNumber = 1;
    this.pageSize = 10;

    this.loadProducts();
  }

  onDeleteProduct(id: number): void {
    const confirmed = confirm('Are you sure you want to delete this product?');

    if (!confirmed) {
      return;
    }

    this.errorMessage = null;
    this.successMessage = null;
    this.cdr.markForCheck();

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.successMessage = 'Product deleted successfully.';
        this.loadProducts();
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