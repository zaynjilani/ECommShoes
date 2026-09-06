import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ToastService } from '../../../core/services/toast.service';
import { STORE_CONFIG } from '../../../core/config/store.config';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private toast = inject(ToastService);

  @Input({ required: true }) product!: Product;
  @Output() quickAdd = new EventEmitter<Product>();

  readonly currency = STORE_CONFIG.currency;

  get isWishlisted(): boolean {
    return this.wishlistService.isSaved(this.product.id);
  }

  get discountPercent(): number | null {
    if (!this.product.compareAtPrice || this.product.compareAtPrice <= this.product.price) return null;
    return Math.round(
      ((this.product.compareAtPrice - this.product.price) / this.product.compareAtPrice) * 100
    );
  }

  toggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlistService.toggle(this.product.id);
    this.toast.info(this.isWishlisted ? 'Added to wishlist' : 'Removed from wishlist');
  }

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const defaultSize = this.product.size[0] ?? 'One Size';
    this.cartService.addItem(this.product, defaultSize, 1);
    this.toast.success(`${this.product.name} added to cart`);
  }
}
