import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'luxe_wishlist_v1';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private idsSubject = new BehaviorSubject<number[]>(this.read());
  readonly ids$ = this.idsSubject.asObservable();

  isSaved(id: number): boolean {
    return this.idsSubject.value.includes(id);
  }

  toggle(id: number): void {
    const current = this.idsSubject.value;
    const next = current.includes(id) ? current.filter((i) => i !== id) : [...current, id];
    this.idsSubject.next(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  private read(): number[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
