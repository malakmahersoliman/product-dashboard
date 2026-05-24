import { computed, Injectable, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { CartItem } from '../models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly storageKey = 'cart_items';
  private readonly itemsSignal = signal<CartItem[]>(this.loadFromStorage());

  readonly items = this.itemsSignal.asReadonly();

  readonly itemCount = computed(() =>
    this.items().reduce((total, item) => total + item.quantity, 0)
  );

  readonly total = computed(() =>
    this.items().reduce((total, item) => total + item.price * item.quantity, 0)
  );

  getQuantity(productId: number): number {
    return this.items().find((item) => item.productId === productId)?.quantity ?? 0;
  }

  increase(product: Product): void {
    if (product.isAvailable === false || product.stock === 0) {
      return;
    }

    const items = [...this.items()];
    const index = items.findIndex((item) => item.productId === product.id);

    if (index === -1) {
      items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.stock,
      });
    } else if (items[index].quantity < product.stock) {
      items[index] = {
        ...items[index],
        quantity: items[index].quantity + 1,
        stock: product.stock,
        price: product.price,
      };
    }

    this.save(items);
  }

  increaseInCart(productId: number): void {
    const items = [...this.items()];
    const index = items.findIndex((item) => item.productId === productId);

    if (index === -1 || items[index].quantity >= items[index].stock) {
      return;
    }

    items[index] = {
      ...items[index],
      quantity: items[index].quantity + 1,
    };

    this.save(items);
  }

  decrease(productId: number): void {
    const items = [...this.items()];
    const index = items.findIndex((item) => item.productId === productId);

    if (index === -1) {
      return;
    }

    if (items[index].quantity <= 1) {
      items.splice(index, 1);
    } else {
      items[index] = {
        ...items[index],
        quantity: items[index].quantity - 1,
      };
    }

    this.save(items);
  }

  remove(productId: number): void {
    this.save(this.items().filter((item) => item.productId !== productId));
  }

  clear(): void {
    this.save([]);
  }

  toOrderItems(): { productId: number; quantity: number }[] {
    return this.items().map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));
  }

  private save(items: CartItem[]): void {
    this.itemsSignal.set(items);
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  private loadFromStorage(): CartItem[] {
    const stored = localStorage.getItem(this.storageKey);

    if (!stored) {
      return [];
    }

    try {
      return JSON.parse(stored) as CartItem[];
    } catch {
      return [];
    }
  }
}
