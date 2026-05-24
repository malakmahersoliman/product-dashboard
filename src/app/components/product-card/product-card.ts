import { Component, EventEmitter, Input, Output, ChangeDetectorRef, inject } from '@angular/core';
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

  get isLowStock(): boolean {
    return this.product.stock > 0 && this.product.stock < 5;
  }

  get canAddToCart(): boolean {
    return (this.product.isAvailable ?? true) && this.product.stock > 0;
  }

  onIncrease(): void {
    this.cartService.increase(this.product);
    this.cdr.markForCheck();
  }

  onDecrease(): void {
    this.cartService.decrease(this.product.id);
    this.cdr.markForCheck();
  }

  onDeleteClick(): void {
    this.deleteProduct.emit(this.product.id);
  }
}
