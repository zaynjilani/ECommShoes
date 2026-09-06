import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, map, startWith } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'newest';

interface Filters {
  q: string;
  category: string;
  sizes: string[];
  minPrice: number | null;
  maxPrice: number | null;
  sort: SortOption;
}

const DEFAULT_FILTERS: Filters = {
  q: '',
  category: 'All',
  sizes: [],
  minPrice: null,
  maxPrice: null,
  sort: 'default',
};

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductCardComponent, LoadingComponent, EmptyStateComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  allProducts: Product[] = [];
  loading = true;
  isFilterPanelOpen = false;

  categories: string[] = [];
  availableSizes: string[] = [];
  priceBounds = { min: 0, max: 20000 };

  filters: Filters = { ...DEFAULT_FILTERS };

  private filtersSubject = new BehaviorSubject<Filters>(this.filters);
  filteredProducts$!: Observable<Product[]>;

  ngOnInit(): void {
    this.productService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((products) => {
        this.allProducts = products;
        this.loading = false;
        this.categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];
        this.availableSizes = Array.from(new Set(products.flatMap((p) => p.size))).sort();
        const prices = products.map((p) => p.price);
        this.priceBounds = { min: Math.min(...prices), max: Math.max(...prices) };

        this.readFiltersFromQueryParams();
        this.filtersSubject.next(this.filters);
      });

    this.filteredProducts$ = this.filtersSubject.pipe(
      startWith(this.filters),
      map((filters) => this.applyFilters(this.allProducts, filters))
    );

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.allProducts.length) {
        this.readFiltersFromQueryParams();
        this.filtersSubject.next({ ...this.filters });
      }
    });
  }

  private readFiltersFromQueryParams(): void {
    const params = this.route.snapshot.queryParamMap;
    this.filters = {
      q: params.get('q') ?? '',
      category: params.get('category') ?? 'All',
      sizes: params.get('size') ? params.get('size')!.split(',') : [],
      minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : null,
      maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : null,
      sort: (params.get('sort') as SortOption) ?? 'default',
    };
  }

  private applyFilters(products: Product[], filters: Filters): Product[] {
    let result = [...products];

    if (filters.q.trim()) {
      const q = filters.q.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (filters.category && filters.category !== 'All') {
      if (filters.category === 'New Arrivals') {
        result = result.filter((p) => p.isNewArrival);
      } else if (filters.category === 'Sale') {
        result = result.filter((p) => p.isOnSale);
      } else {
        result = result.filter((p) => p.category === filters.category);
      }
    }

    if (filters.sizes.length) {
      result = result.filter((p) => p.size.some((s) => filters.sizes.includes(s)));
    }

    if (filters.minPrice != null) {
      result = result.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice != null) {
      result = result.filter((p) => p.price <= filters.maxPrice!);
    }

    switch (filters.sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        result.sort(
          (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        );
        break;
    }

    return result;
  }

  // ---------------- UI event handlers ----------------

  updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.filters.q || null,
        category: this.filters.category !== 'All' ? this.filters.category : null,
        size: this.filters.sizes.length ? this.filters.sizes.join(',') : null,
        minPrice: this.filters.minPrice,
        maxPrice: this.filters.maxPrice,
        sort: this.filters.sort !== 'default' ? this.filters.sort : null,
      },
      queryParamsHandling: 'merge',
    });
  }

  selectCategory(category: string): void {
    this.filters.category = category;
    this.updateQueryParams();
  }

  toggleSize(size: string): void {
    const idx = this.filters.sizes.indexOf(size);
    if (idx > -1) this.filters.sizes.splice(idx, 1);
    else this.filters.sizes.push(size);
    this.updateQueryParams();
  }

  applyPriceRange(): void {
    this.updateQueryParams();
  }

  changeSort(sort: string): void {
    this.filters.sort = sort as SortOption;
    this.updateQueryParams();
  }

  runSearch(): void {
    this.updateQueryParams();
  }

  clearFilters(): void {
    this.filters = { ...DEFAULT_FILTERS };
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  get activeFilterCount(): number {
    let count = 0;
    if (this.filters.category !== 'All') count++;
    if (this.filters.sizes.length) count++;
    if (this.filters.minPrice != null || this.filters.maxPrice != null) count++;
    return count;
  }

  toggleFilterPanel(): void {
    this.isFilterPanelOpen = !this.isFilterPanelOpen;
  }
}
