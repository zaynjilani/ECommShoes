import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Order } from '../../core/models/order.model';
import { STORE_CONFIG } from '../../core/config/store.config';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-success.component.html',
  styleUrl: './order-success.component.scss',
})
export class OrderSuccessComponent implements OnInit {
  readonly currency = STORE_CONFIG.currency;
  order: Order | null = null;

  ngOnInit(): void {
    const historyState = history.state as { order?: Order } | undefined;
    this.order = historyState?.order ?? this.readFromStorage();
  }

  private readFromStorage(): Order | null {
    try {
      const raw = localStorage.getItem('Js Kics & Co_last_order');
      return raw ? (JSON.parse(raw) as Order) : null;
    } catch {
      return null;
    }
  }

  subtotalFor(unitPrice: number, quantity: number): number {
    return unitPrice * quantity;
  }
}
