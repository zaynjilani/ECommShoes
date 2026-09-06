import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { STORE_CONFIG } from '../../../core/config/store.config';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private cartService = inject(CartService);
  private router = inject(Router);

  readonly config = STORE_CONFIG;
  readonly itemCount$ = this.cartService.itemCount$;

  isScrolled = false;
  isMobileMenuOpen = false;
  isSearchOpen = false;
  searchTerm = '';

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = (typeof window !== 'undefined' ? window.scrollY : 0) > 12;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) this.isSearchOpen = false;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
  }

  submitSearch(): void {
    const term = this.searchTerm.trim();
    if (!term) return;
    this.router.navigate(['/products'], { queryParams: { q: term } });
    this.isSearchOpen = false;
    this.isMobileMenuOpen = false;
    this.searchTerm = '';
  }
}
