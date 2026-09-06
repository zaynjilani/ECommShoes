import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, shareReplay, tap } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private categories$?: Observable<Category[]>;

  getAll(): Observable<Category[]> {
    if (!this.categories$) {
      this.categories$ = this.http.get<Category[]>('assets/data/categories.json').pipe(
        tap({
          error: (err) =>
            console.error(
              '[CategoryService] Failed to load assets/data/categories.json — check that the file exists and the dev server is serving it correctly.',
              err
            ),
        }),
        catchError(() => of([])),
        shareReplay(1)
      );
    }
    return this.categories$;
  }
}
