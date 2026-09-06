import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quantity-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quantity-selector.component.html',
  styleUrl: './quantity-selector.component.scss',
})
export class QuantitySelectorComponent {
  @Input() quantity = 1;
  @Input() min = 1;
  @Input() max = 99;
  @Input() size: 'sm' | 'md' = 'md';
  @Output() quantityChange = new EventEmitter<number>();

  decrease(): void {
    if (this.quantity > this.min) {
      this.quantityChange.emit(this.quantity - 1);
    }
  }

  increase(): void {
    if (this.quantity < this.max) {
      this.quantityChange.emit(this.quantity + 1);
    }
  }
}
