import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { STORE_CONFIG } from '../../core/config/store.config';
import { QuantitySelectorComponent } from '../../shared/components/quantity-selector/quantity-selector.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    QuantitySelectorComponent,
    ProductCardComponent,
    LoadingComponent,
    EmptyStateComponent,
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  readonly currency = STORE_CONFIG.currency;

  product: Product | null = null;
  relatedProducts: Product[] = [];
  loading = true;
  notFound = false;

  selectedImage = '';
  selectedSize = '';
  quantity = 1;

  get isWishlisted(): boolean {
    return this.product ? this.wishlistService.isSaved(this.product.id) : false;
  }

  get discountPercent(): number | null {
    if (!this.product?.compareAtPrice || this.product.compareAtPrice <= this.product.price) return null;
    return Math.round(
      ((this.product.compareAtPrice - this.product.price) / this.product.compareAtPrice) * 100
    );
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap(() => {
          this.loading = true;
          this.notFound = false;
          this.quantity = 1;
        }),
        switchMap((params) => {
          const id = Number(params.get('id'));
          return this.productService.getById(id);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((product) => {
        this.loading = false;
        if (!product) {
          this.notFound = true;
          this.product = null;
          return;
        }
        this.product = product;
        this.selectedImage = product.imageUrl;
        this.selectedSize = product.size[0] ?? '';
        this.loadRelated(product);
        if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
      });
  }

  private loadRelated(product: Product): void {
    this.productService
      .getByCategory(product.category)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((products) => {
        this.relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 4);
      });
  }

  get gallery(): string[] {
    if (!this.product) return [];
    const images = this.product.images?.length ? this.product.images : [this.product.imageUrl];
    return Array.from(new Set(images));
  }

  selectImage(url: string): void {
    this.selectedImage = url;
  }

  selectSize(size: string): void {
    this.selectedSize = size;
  }

  setQuantity(qty: number): void {
    this.quantity = qty;
  }

  toggleWishlist(): void {
    if (!this.product) return;
    this.wishlistService.toggle(this.product.id);
    this.toast.info(this.isWishlisted ? 'Added to wishlist' : 'Removed from wishlist');
  }

  addToCart(): void {
    if (!this.product) return;
    if (!this.selectedSize) {
      this.toast.error('Please select a size.');
      return;
    }
    this.cartService.addItem(this.product, this.selectedSize, this.quantity);
    this.toast.success(`${this.product.name} added to cart`);
  }

  buyNow(): void {
    if (!this.product) return;
    if (!this.selectedSize) {
      this.toast.error('Please select a size.');
      return;
    }
    this.cartService.addItem(this.product, this.selectedSize, this.quantity);
    this.router.navigate(['/checkout']);
  }
}
