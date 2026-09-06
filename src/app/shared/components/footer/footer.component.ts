import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { STORE_CONFIG } from '../../../core/config/store.config';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  private toast = inject(ToastService);

  readonly config = STORE_CONFIG;
  readonly year = new Date().getFullYear();
  newsletterEmail = '';

  subscribe(): void {
    if (!this.newsletterEmail || !this.newsletterEmail.includes('@')) {
      this.toast.error('Please enter a valid email address.');
      return;
    }
    this.toast.success('Thanks for subscribing! Check your inbox for 10% off.');
    this.newsletterEmail = '';
  }
}
