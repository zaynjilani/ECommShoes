import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { CartItem, CartTotals } from '../models/cart-item.model';
import { Product } from '../models/product.model';
import { STORE_CONFIG } from '../config/store.config';

const STORAGE_KEY = 'luxe_cart_v1';

/**
 * CartService is the single, centralized owner of shopping-cart state.
 *
 * It is provided in root (a singleton for the whole app lifetime), keeps
 * its state in a BehaviorSubject, and mirrors every mutation to
 * LocalStorage immediately. Because it's a singleton service (not
 * component state) the cart naturally survives Angular route navigation,
 * and because it's backed by LocalStorage it also survives full page
 * reloads — satisfying the "cart must never reset" requirement.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>(this.readFromStorage());

  /** Stream of the raw cart line items. */
  readonly items$ = this.itemsSubject.asObservable();

  /** Stream of computed totals (item count, subtotal, delivery, grand total). */
  readonly totals$ = this.items$.pipe(map((items) => this.computeTotals(items)));

  /** Stream of just the badge count shown in the header. */
  readonly itemCount$ = this.items$.pipe(
    map((items) => items.reduce((sum, item) => sum + item.quantity, 0))
  );

  get snapshot(): CartItem[] {
    return this.itemsSubject.value;
  }

  addItem(product: Product, size: string, quantity: number = 1): void {
    const items = [...this.itemsSubject.value];
    const existingIndex = items.findIndex(
      (i) => i.productId === product.id && i.size === size
    );

    if (existingIndex > -1) {
      items[existingIndex] = {
        ...items[existingIndex],
        quantity: items[existingIndex].quantity + quantity,
      };
    } else {
      items.push({
        productId: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        size,
        unitPrice: product.price,
        quantity,
        category: product.category,
      });
    }

    this.commit(items);
  }

  updateQuantity(productId: number, size: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId, size);
      return;
    }
    const items = this.itemsSubject.value.map((item) =>
      item.productId === productId && item.size === size ? { ...item, quantity } : item
    );
    this.commit(items);
  }

  removeItem(productId: number, size: string): void {
    const items = this.itemsSubject.value.filter(
      (item) => !(item.productId === productId && item.size === size)
    );
    this.commit(items);
  }

  clear(): void {
    this.commit([]);
  }

  private computeTotals(items: CartItem[]): CartTotals {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const deliveryCharge =
      items.length === 0
        ? 0
        : subtotal >= STORE_CONFIG.freeDeliveryThreshold
        ? 0
        : STORE_CONFIG.deliveryCharges;
    const total = subtotal + deliveryCharge;
    return { itemCount, subtotal, deliveryCharge, total };
  }

  private commit(items: CartItem[]): void {
    this.itemsSubject.next(items);
    this.writeToStorage(items);
  }

  private readFromStorage(): CartItem[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private writeToStorage(items: CartItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore quota/availability errors — cart still works in-memory for this session.
    }
  }
}
