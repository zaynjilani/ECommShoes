import { Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, combineLatest, map } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { STORE_CONFIG } from '../../core/config/store.config';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { CategoryCardComponent } from '../../shared/components/category-card/category-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, CategoryCardComponent, LoadingComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private destroyRef = inject(DestroyRef);

  readonly config = STORE_CONFIG;
  readonly banners = STORE_CONFIG.banners;

  featuredProducts$!: Observable<Product[]>;
  newArrivals$!: Observable<Product[]>;
  categoriesWithCounts$!: Observable<{ category: Category; count: number }[]>;
  loading = true;

  activeSlide = 0;
  private slideTimer?: ReturnType<typeof setInterval>;

  readonly benefits = [
    {
      title: 'Free Delivery',
      description: `On all orders over ${STORE_CONFIG.currency} ${STORE_CONFIG.freeDeliveryThreshold.toLocaleString()}`,
      icon: 'truck',
    },
    {
      title: 'Easy WhatsApp Ordering',
      description: 'Place your order in a single tap, no account needed',
      icon: 'chat',
    },
    {
      title: 'Quality Guaranteed',
      description: 'Every piece checked for premium fabric and finish',
      icon: 'shield',
    },
    {
      title: 'Simple Returns',
      description: '7-day easy exchange on unworn items',
      icon: 'refresh',
    },
  ];

  ngOnInit(): void {
    this.featuredProducts$ = this.productService.getFeatured();
    this.newArrivals$ = this.productService.getNewArrivals();

    this.categoriesWithCounts$ = combineLatest([
      this.categoryService.getAll(),
      this.productService.getCategoryCounts(),
    ]).pipe(
      map(([categories, counts]) =>
        categories.map((category) => ({ category, count: counts[category.name] ?? 0 }))
      )
    );

    this.productService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => (this.loading = false));

    this.slideTimer = setInterval(() => this.nextSlide(), 6000);
  }

  ngOnDestroy(): void {
    if (this.slideTimer) clearInterval(this.slideTimer);
  }

  goToSlide(index: number): void {
    this.activeSlide = index;
  }

  nextSlide(): void {
    this.activeSlide = (this.activeSlide + 1) % this.banners.length;
  }

  prevSlide(): void {
    this.activeSlide = (this.activeSlide - 1 + this.banners.length) % this.banners.length;
  }

  /** Splits a config link like "/products?category=Sale" into path + queryParams for routerLink. */
  parseLink(link: string): { path: string; queryParams: Record<string, string> } {
    const [path, query] = link.split('?');
    const queryParams: Record<string, string> = {};
    if (query) {
      new URLSearchParams(query).forEach((value, key) => (queryParams[key] = value));
    }
    return { path, queryParams };
  }
}
