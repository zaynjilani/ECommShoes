import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, catchError, combineLatest, map, of, timeout } from 'rxjs';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { Category } from '../../core/models/category.model';
import { CategoryCardComponent } from '../../shared/components/category-card/category-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, CategoryCardComponent, LoadingComponent, EmptyStateComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private productService = inject(ProductService);

  categoriesWithCounts$!: Observable<{ category: Category; count: number }[]>;
  loading = true;
  loadError = false;

  ngOnInit(): void {
    console.log('[CategoriesComponent] ngOnInit — starting to load categories + counts');

    this.categoriesWithCounts$ = combineLatest([
      this.categoryService.getAll(),
      this.productService.getCategoryCounts(),
    ]).pipe(
      // Safety net: if something hangs (e.g. a blocked/slow request) for more
      // than 8 seconds, stop waiting and show an error state instead of
      // spinning forever.
      timeout(8000),
      map(([categories, counts]) => {
        console.log('[CategoriesComponent] loaded', {
          categoryCount: categories.length,
          productCounts: counts,
        });
        this.loading = false;
        this.loadError = false;
        return categories.map((category) => ({ category, count: counts[category.name] ?? 0 }));
      }),
      catchError((err) => {
        console.error('[CategoriesComponent] Failed to load categories/counts:', err);
        this.loading = false;
        this.loadError = true;
        return of([]);
      })
    );
  }
}
