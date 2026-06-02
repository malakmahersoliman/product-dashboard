import { Component, EventEmitter, Input, Output, ChangeDetectorRef, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CommonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  @Input() product!: Product;
  @Output() deleteProduct = new EventEmitter<number>();

  authService = inject(AuthService);
  cartService = inject(CartService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    effect(() => {
      this.cartService.items();
      this.cdr.markForCheck();
    });
  }

  cartQty(productId: number): number {
    return this.cartService.getQuantity(productId);
  }

  hasInCart(productId: number): boolean {
    return this.cartQty(productId) > 0;
  }

  isOutOfStock(product: Product): boolean {
    return product.stock === 0 || product.isAvailable === false;
  }

  isLowStock(product: Product): boolean {
    return product.stock > 0 && product.stock < 5;
  }

  isMaxStockReached(product: Product): boolean {
    return product.stock > 0 && this.cartQty(product.id) >= product.stock;
  }

  canIncrement(product: Product): boolean {
    return !this.isOutOfStock(product) && this.cartQty(product.id) < product.stock;
  }

  canAddToCart(product: Product): boolean {
    return this.canIncrement(product);
  }

  incrementQty(product: Product): void {
    this.cartService.increase(product);
    this.cdr.markForCheck();
  }

  decrementQty(product: Product): void {
    this.cartService.decrease(product.id);
    this.cdr.markForCheck();
  }

  onAddToCart(): void {
    if (this.canAddToCart(this.product)) {
      this.cartService.increase(this.product);
      this.cdr.markForCheck();
    }
  }

  onDeleteClick(): void {
    this.deleteProduct.emit(this.product.id);
  }

  statusBadgeClass(product: Product): string {
    if (this.isOutOfStock(product)) {
      return 'badge-unavailable';
    }
    if (this.isLowStock(product)) {
      return 'badge-low-stock';
    }
    return 'badge-available';
  }

  statusLabel(product: Product): string {
    if (this.isOutOfStock(product)) {
      return 'Out of Stock';
    }
    if (this.isLowStock(product)) {
      return 'Low Stock';
    }
    return 'Available';
  }
}
