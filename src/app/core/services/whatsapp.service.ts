import { Injectable } from '@angular/core';
import { STORE_CONFIG } from '../config/store.config';
import { CustomerInfo, Order } from '../models/order.model';
import { CartItem } from '../models/cart-item.model';

/**
 * WhatsappService builds a nicely formatted order message and opens
 * WhatsApp with it pre-filled, using the centralized business number
 * from STORE_CONFIG (never hardcoded in components).
 */
@Injectable({ providedIn: 'root' })
export class WhatsappService {
  /** Generates a human-friendly, sortable order reference, e.g. ORD-20260904-001 */
  generateOrderReference(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 900 + 100); // 3-digit
    return `ORD-${y}${m}${d}-${random}`;
  }

  buildOrderMessage(order: Order): string {
    const lines: string[] = [];
    lines.push('Hello, I would like to place an order.');
    lines.push('');
    lines.push(`Order Reference: ${order.reference}`);
    lines.push('');
    lines.push('Customer:');
    lines.push(`Name: ${order.customer.name}`);
    lines.push(`WhatsApp: ${order.customer.whatsapp}`);
    if (order.customer.email) lines.push(`Email: ${order.customer.email}`);
    lines.push(`Address: ${order.customer.address}`);
    lines.push(`City: ${order.customer.city}`);
    if (order.customer.notes) lines.push(`Notes: ${order.customer.notes}`);
    lines.push('');
    lines.push('Order:');
    lines.push('');

    order.items.forEach((item, index) => {
      const subtotal = item.unitPrice * item.quantity;
      lines.push(`${index + 1}. ${item.name}`);
      lines.push(`Size: ${item.size}`);
      lines.push(`Quantity: ${item.quantity}`);
      lines.push(`Price: ${STORE_CONFIG.currency} ${this.formatNumber(item.unitPrice)}`);
      lines.push(`Subtotal: ${STORE_CONFIG.currency} ${this.formatNumber(subtotal)}`);
      lines.push('');
    });

    lines.push(`Subtotal: ${STORE_CONFIG.currency} ${this.formatNumber(order.subtotal)}`);
    lines.push(`Delivery: ${STORE_CONFIG.currency} ${this.formatNumber(order.deliveryCharge)}`);
    lines.push(`Total: ${STORE_CONFIG.currency} ${this.formatNumber(order.total)}`);
    lines.push('');
    lines.push('Thank you.');

    return lines.join('\n');
  }

  buildWhatsAppUrl(message: string): string {
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encoded}`;
  }

  createOrder(customer: CustomerInfo, items: CartItem[], subtotal: number, deliveryCharge: number): Order {
    return {
      reference: this.generateOrderReference(),
      createdAt: new Date().toISOString(),
      customer,
      items,
      subtotal,
      deliveryCharge,
      total: subtotal + deliveryCharge,
    };
  }

  /** Opens WhatsApp in a new tab with the order message pre-filled. */
  openWhatsAppOrder(order: Order): void {
    const message = this.buildOrderMessage(order);
    const url = this.buildWhatsAppUrl(message);
    window.open(url, '_blank', 'noopener');
  }

  private formatNumber(value: number): string {
    return value.toLocaleString('en-US');
  }
}
