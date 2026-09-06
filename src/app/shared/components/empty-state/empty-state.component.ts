import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  @Input() icon: 'search' | 'cart' | 'error' | 'box' = 'box';
  @Input() title = 'Nothing here yet';
  @Input() message = '';
  @Input() actionLabel = '';
}
