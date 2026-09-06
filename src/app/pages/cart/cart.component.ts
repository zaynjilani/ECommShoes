import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { STORE_CONFIG } from '../../core/config/store.config';
import { QuantitySelectorComponent } from '../../shared/components/quantity-selector/quantity-selector.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, QuantitySelectorComponent, EmptyStateComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  private cartService = inject(CartService);
  private confirmService = inject(ConfirmService);
  private toast = inject(ToastService);

  readonly currency = STORE_CONFIG.currency;
  readonly freeDeliveryThreshold = STORE_CONFIG.freeDeliveryThreshold;
  readonly items$ = this.cartService.items$;
  readonly totals$ = this.cartService.totals$;

  updateQuantity(productId: number, size: string, quantity: number): void {
    this.cartService.updateQuantity(productId, size, quantity);
  }

  async removeItem(productId: number, size: string, name: string): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Remove item?',
      message: `Remove "${name}" (${size}) from your cart?`,
      confirmLabel: 'Remove',
      danger: true,
    });
    if (confirmed) {
      this.cartService.removeItem(productId, size);
      this.toast.info('Item removed from cart');
    }
  }

  async clearCart(): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Clear cart?',
      message: 'This will remove all items from your cart. This action cannot be undone.',
      confirmLabel: 'Clear Cart',
      danger: true,
    });
    if (confirmed) {
      this.cartService.clear();
      this.toast.info('Cart cleared');
    }
  }
}
