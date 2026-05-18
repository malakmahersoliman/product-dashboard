import { Component, EventEmitter, Input, Output  } from '@angular/core';
import { Product } from '../../models/product.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  @Input() product!: Product;
  @Output() deleteProduct = new EventEmitter<number>();

  onDeleteClick(): void {
  this.deleteProduct.emit(this.product.id);
}
}