import { Component, OnInit, ChangeDetectorRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ProductCard } from '../../components/product-card/product-card';
import { Pagination } from '../../components/pagination/pagination';
import { ListFilterPanel } from '../../components/list-filter-panel/list-filter-panel';
import {
  FilterValues,
  ListFilterField,
  ListFilterSearchEvent,
} from '../../components/list-filter-panel/list-filter-panel.model';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-products',
  imports: [ProductCard, Pagination, ListFilterPanel, RouterLink, CommonModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  @ViewChild(ListFilterPanel) filterPanel?: ListFilterPanel;

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
  pageSize = 20;
  totalCount = 0;
  totalPages = 0;

  sortBy = 'name';
  sortDirection = 'asc';

  readonly pageSizeOptions = [10, 20, 50];

  readonly defaultProductFilterValues: FilterValues = {
    search: '',
    categoryId: null,
    availability: 'All',
    stockStatus: 'All',
    sort: 'name:asc',
  };

  readonly productFilterFields: ListFilterField[] = [
    {
      key: 'search',
      type: 'search',
      label: 'Search',
      chipLabel: 'Search',
      placeholder: 'Product name or category...',
      ariaLabel: 'Search products',
    },
    {
      key: 'availability',
      type: 'button-group',
      label: 'Availability',
      groupLabel: 'Filter by availability',
      options: [
        { label: 'All', value: 'All' },
        { label: 'Available', value: true },
        { label: 'Unavailable', value: false },
      ],
    },
    {
      key: 'stockStatus',
      type: 'button-group',
      label: 'Stock',
      groupLabel: 'Filter by stock level',
      options: [
        { label: 'All', value: 'All' },
        { label: 'In stock', value: 'inStock' },
        { label: 'Low stock', value: 'lowStock' },
        { label: 'Out of stock', value: 'outOfStock' },
      ],
    },
    {
      key: 'categoryId',
      type: 'select',
      label: 'Category',
      disabled: true,
      options: [{ label: 'Loading categories...', value: null }],
    },
    {
      key: 'sort',
      type: 'select',
      label: 'Sort',
      options: [
        { label: 'Name A-Z', value: 'name:asc' },
        { label: 'Name Z-A', value: 'name:desc' },
        { label: 'Price Low to High', value: 'price:asc' },
        { label: 'Price High to Low', value: 'price:desc' },
        { label: 'Stock Low to High', value: 'stock:asc' },
        { label: 'Stock High to Low', value: 'stock:desc' },
        { label: 'Category A-Z', value: 'category:asc' },
        { label: 'Category Z-A', value: 'category:desc' },
      ],
    },
  ];

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

  get hasActiveFilters(): boolean {
    return (
      !!this.searchTerm.trim() ||
      this.selectedCategoryId !== null ||
      this.selectedAvailability !== null ||
      !!this.selectedStockStatus ||
      `${this.sortBy}:${this.sortDirection}` !== 'name:asc'
    );
  }

  get rangeStart(): number {
    if (this.totalCount === 0) {
      return 0;
    }

    return (this.pageNumber - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    if (this.totalCount === 0) {
      return 0;
    }

    return Math.min(this.pageNumber * this.pageSize, this.totalCount);
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
        this.updateCategoryFilterOptions();
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

  onFilterSearch(event: ListFilterSearchEvent): void {
    this.searchTerm = String(event.values['search'] ?? '');

    const categoryId = event.values['categoryId'];
    this.selectedCategoryId =
      categoryId === null || categoryId === undefined || categoryId === ''
        ? null
        : Number(categoryId);

    const availability = event.values['availability'];
    this.selectedAvailability =
      availability === 'All' ? null : (availability as boolean | null);

    const stockStatus = event.values['stockStatus'];
    this.selectedStockStatus = stockStatus === 'All' ? '' : String(stockStatus ?? '');

    const sortValue = String(event.values['sort'] ?? 'name:asc');
    const [sortBy, sortDirection] = sortValue.split(':');
    this.sortBy = sortBy;
    this.sortDirection = sortDirection;

    this.pageNumber = 1;
    this.loadProducts();
  }

  onPageChange(pageNumber: number): void {
    this.pageNumber = pageNumber;
    this.loadProducts();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageNumber = 1;
    this.loadProducts();
  }

  clearFilters(): void {
    this.filterPanel?.onReset();
  }

  private updateCategoryFilterOptions(): void {
    const categoryField = this.productFilterFields.find((field) => field.key === 'categoryId');

    if (!categoryField || categoryField.type !== 'select') {
      return;
    }

    categoryField.disabled = false;
    categoryField.options = [
      { label: 'All categories', value: null },
      ...this.categories.map((category) => ({
        label: category.name,
        value: category.id,
      })),
    ];
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
