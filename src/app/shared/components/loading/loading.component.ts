import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss',
})
export class LoadingComponent {
  /** 'grid' renders skeleton product cards; 'spinner' renders a centered spinner. */
  @Input() variant: 'grid' | 'spinner' = 'grid';
  @Input() count = 8;

  get items(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
