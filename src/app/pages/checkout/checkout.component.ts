import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { WhatsappService } from '../../core/services/whatsapp.service';
import { ToastService } from '../../core/services/toast.service';
import { STORE_CONFIG } from '../../core/config/store.config';
import { CartItem } from '../../core/models/cart-item.model';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, EmptyStateComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private whatsappService = inject(WhatsappService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly currency = STORE_CONFIG.currency;
  readonly companyName = STORE_CONFIG.companyName;

  items: CartItem[] = [];
  subtotal = 0;
  deliveryCharge = 0;
  total = 0;
  isPlacingOrder = false;

  checkoutForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    whatsapp: ['', [Validators.required, Validators.pattern(/^[0-9+\s-]{7,15}$/)]],
    email: ['', [Validators.email]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    city: ['', [Validators.required]],
    notes: [''],
  });

  ngOnInit(): void {
    this.cartService.items$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((items) => {
      this.items = items;
    });
    this.cartService.totals$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((totals) => {
      this.subtotal = totals.subtotal;
      this.deliveryCharge = totals.deliveryCharge;
      this.total = totals.total;
    });
  }

  get f() {
    return this.checkoutForm.controls;
  }

  subtotalFor(item: CartItem): number {
    return item.unitPrice * item.quantity;
  }

  placeOrderOnWhatsApp(): void {
    if (this.items.length === 0) {
      this.toast.error('Your cart is empty.');
      return;
    }

    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.toast.error('Please fill in all required fields correctly.');
      return;
    }

    this.isPlacingOrder = true;
    const formValue = this.checkoutForm.getRawValue();

    const order = this.whatsappService.createOrder(
      {
        name: formValue.name.trim(),
        whatsapp: formValue.whatsapp.trim(),
        email: formValue.email?.trim() || undefined,
        address: formValue.address.trim(),
        city: formValue.city.trim(),
        notes: formValue.notes?.trim() || undefined,
      },
      this.items,
      this.subtotal,
      this.deliveryCharge
    );

    this.whatsappService.openWhatsAppOrder(order);

    // Persist the order so the success page can render it even after a refresh.
    try {
      localStorage.setItem('luxe_last_order', JSON.stringify(order));
    } catch {
      /* ignore storage errors */
    }

    // Cart is cleared only after the WhatsApp order action has been initiated.
    this.cartService.clear();

    this.router.navigate(['/order-success'], {
      state: { order },
    });
  }
}
