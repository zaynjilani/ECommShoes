import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, filter, map, of, shareReplay, take, tap } from 'rxjs';
import { Product } from '../models/product.model';

const STORAGE_KEY = 'luxe_products_v1';

/**
 * ProductService is the single source of truth for product data on the
 * frontend. It loads the initial catalog from `assets/data/products.json`
 * and layers any admin CRUD changes on top using LocalStorage, so the
 * prototype behaves like a real persisted store without a backend.
 *
 * IMPORTANT (design note for future backend integration):
 * Every public method here returns an Observable and the internal state
 * is a BehaviorSubject. To swap this for a real REST API later, only the
 * bodies of load()/create()/update()/remove() need to change to call
 * HttpClient against a server — every component that depends on this
 * service will continue to work unmodified.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  /**
   * `null` means "not loaded yet". Consumers never see this value directly —
   * `products$` filters it out — so subscribers never receive a premature
   * empty array before the JSON file has actually loaded.
   */
  private productsSubject = new BehaviorSubject<Product[] | null>(null);
  private initialized = false;
  private initLoad$?: Observable<Product[]>;

  /** Stream of the full product catalog (base JSON + LocalStorage overrides). */
  readonly products$: Observable<Product[]> = this.productsSubject.pipe(
    filter((products): products is Product[] => products !== null)
  );

  /** Ensures the catalog has been loaded exactly once, then returns the stream. */
  private ensureLoaded(): Observable<Product[]> {
    if (!this.initialized && !this.initLoad$) {
      this.initLoad$ = this.http.get<Product[]>('assets/data/products.json').pipe(
        map((baseProducts) => this.mergeWithLocalStorage(baseProducts)),
        tap({
          error: (err) =>
            console.error(
              '[ProductService] Failed to load assets/data/products.json — check that the file exists and the dev server is serving it correctly.',
              err
            ),
        }),
        catchError(() => of([] as Product[])),
        shareReplay(1)
      );
      this.initLoad$.pipe(take(1)).subscribe((merged) => {
        this.initialized = true;
        this.productsSubject.next(merged);
      });
    }
    return this.products$;
  }

  /** Public trigger so app-level code can warm the cache on startup. */
  init(): Observable<Product[]> {
    return this.ensureLoaded();
  }

  getAll(): Observable<Product[]> {
    return this.ensureLoaded();
  }

  getById(id: number): Observable<Product | undefined> {
    return this.getAll().pipe(map((products) => products.find((p) => p.id === id)));
  }

  /**
   * Returns products for a given category. "New Arrivals" and "Sale" are
   * virtual categories backed by product flags rather than the literal
   * `category` field, mirroring how a real storefront curates collections.
   */
  getByCategory(category: string): Observable<Product[]> {
    return this.getAll().pipe(
      map((products) => {
        if (!category || category.toLowerCase() === 'all') return products;
        if (category === 'New Arrivals') return products.filter((p) => p.isNewArrival);
        if (category === 'Sale') return products.filter((p) => p.isOnSale);
        return products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
      })
    );
  }

  search(term: string): Observable<Product[]> {
    const q = term.trim().toLowerCase();
    return this.getAll().pipe(
      map((products) => {
        if (!q) return products;
        return products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
      })
    );
  }

  getFeatured(): Observable<Product[]> {
    return this.getAll().pipe(map((products) => products.filter((p) => p.isFeatured)));
  }

  getNewArrivals(): Observable<Product[]> {
    return this.getAll().pipe(map((products) => products.filter((p) => p.isNewArrival)));
  }

  /** Distinct category names actually present in the catalog. */
  getCategoryCounts(): Observable<Record<string, number>> {
    return this.getAll().pipe(
      map((products) => {
        const counts: Record<string, number> = {};
        for (const p of products) {
          counts[p.category] = (counts[p.category] ?? 0) + 1;
        }
        counts['New Arrivals'] = products.filter((p) => p.isNewArrival).length;
        counts['Sale'] = products.filter((p) => p.isOnSale).length;
        return counts;
      })
    );
  }

  // ---------------------------------------------------------------------
  // CRUD — persisted to LocalStorage for this prototype. See class doc.
  // ---------------------------------------------------------------------

  create(product: Omit<Product, 'id'>): Observable<Product> {
    return this.getAll().pipe(
      take(1),
      map((products) => {
        const nextId = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;
        const newProduct: Product = { ...product, id: nextId, createdAt: new Date().toISOString() };
        const updated = [newProduct, ...products];
        this.persist(updated);
        return newProduct;
      })
    );
  }

  update(id: number, changes: Partial<Product>): Observable<Product | undefined> {
    return this.getAll().pipe(
      take(1),
      map((products) => {
        let updatedProduct: Product | undefined;
        const updated = products.map((p) => {
          if (p.id === id) {
            updatedProduct = { ...p, ...changes, id };
            return updatedProduct;
          }
          return p;
        });
        this.persist(updated);
        return updatedProduct;
      })
    );
  }

  remove(id: number): Observable<boolean> {
    return this.getAll().pipe(
      take(1),
      map((products) => {
        const updated = products.filter((p) => p.id !== id);
        const changed = updated.length !== products.length;
        if (changed) this.persist(updated);
        return changed;
      })
    );
  }

  /** Restores the catalog to the original products.json, discarding LocalStorage edits. */
  resetToDefaults(): Observable<Product[]> {
    localStorage.removeItem(STORAGE_KEY);
    return this.http.get<Product[]>('assets/data/products.json').pipe(
      map((baseProducts) => {
        this.productsSubject.next(baseProducts);
        this.initialized = true;
        return baseProducts;
      })
    );
  }

  hasLocalOverrides(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  // ---------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------

  private mergeWithLocalStorage(baseProducts: Product[]): Product[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return baseProducts;
      const stored = JSON.parse(raw) as Product[];
      return Array.isArray(stored) ? stored : baseProducts;
    } catch {
      return baseProducts;
    }
  }

  private persist(products: Product[]): void {
    this.productsSubject.next(products);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch {
      // Storage full or unavailable — state still updates in-memory for this session.
    }
  }
}
