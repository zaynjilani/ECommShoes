import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { STORE_CONFIG } from '../../core/config/store.config';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

const CATEGORY_OPTIONS = ['Men', 'Women', 'Kids', 'Shoes', 'Accessories'];

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingComponent, EmptyStateComponent],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss',
})
export class AdminProductsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private confirmService = inject(ConfirmService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  readonly currency = STORE_CONFIG.currency;
  readonly categoryOptions = CATEGORY_OPTIONS;

  products: Product[] = [];
  loading = true;
  searchTerm = '';

  isFormOpen = false;
  isEditMode = false;
  editingId: number | null = null;
  isSaving = false;

  productForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    price: [0, [Validators.required, Validators.min(1)]],
    compareAtPrice: [null as number | null],
    category: [CATEGORY_OPTIONS[0], [Validators.required]],
    sizes: ['', [Validators.required]], // comma-separated in the UI
    imageUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    stock: [0, [Validators.min(0)]],
    isNewArrival: [false],
    isFeatured: [false],
    isOnSale: [false],
  });

  ngOnInit(): void {
    // A single long-lived subscription: every CRUD mutation writes through
    // ProductService's shared subject, so this list stays in sync
    // automatically without ever needing to be manually re-fetched.
    this.productService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((products) => {
        this.products = products;
        this.loading = false;
      });
  }

  get filteredProducts(): Product[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.products;
    return this.products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }

  get f() {
    return this.productForm.controls;
  }

  get imagePreviewUrl(): string {
    return this.productForm.controls.imageUrl.value;
  }

  get isImageUrlValidLooking(): boolean {
    const control = this.productForm.controls.imageUrl;
    return control.valid && !!control.value;
  }

  openCreateForm(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.productForm.reset({
      name: '',
      price: 0,
      compareAtPrice: null,
      category: CATEGORY_OPTIONS[0],
      sizes: '',
      imageUrl: '',
      description: '',
      stock: 0,
      isNewArrival: false,
      isFeatured: false,
      isOnSale: false,
    });
    this.isFormOpen = true;
  }

  openEditForm(product: Product): void {
    this.isEditMode = true;
    this.editingId = product.id;
    this.productForm.setValue({
      name: product.name,
      price: product.price,
      compareAtPrice: product.compareAtPrice ?? null,
      category: product.category,
      sizes: product.size.join(', '),
      imageUrl: product.imageUrl,
      description: product.description,
      stock: product.stock ?? 0,
      isNewArrival: !!product.isNewArrival,
      isFeatured: !!product.isFeatured,
      isOnSale: !!product.isOnSale,
    });
    this.isFormOpen = true;
  }

  closeForm(): void {
    this.isFormOpen = false;
  }

  save(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.toast.error('Please fix the highlighted fields.');
      return;
    }

    this.isSaving = true;
    const value = this.productForm.getRawValue();
    const sizeArray = value.sizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: value.name.trim(),
      price: Number(value.price),
      compareAtPrice: value.compareAtPrice ? Number(value.compareAtPrice) : null,
      category: value.category,
      size: sizeArray,
      imageUrl: value.imageUrl.trim(),
      images: [value.imageUrl.trim()],
      description: value.description.trim(),
      stock: Number(value.stock) || 0,
      isNewArrival: value.isNewArrival,
      isFeatured: value.isFeatured,
      isOnSale: value.isOnSale,
    };

    if (this.isEditMode && this.editingId != null) {
      this.productService.update(this.editingId, payload).subscribe(() => {
        this.isSaving = false;
        this.isFormOpen = false;
        this.toast.success('Product updated successfully.');
      });
    } else {
      this.productService.create(payload).subscribe(() => {
        this.isSaving = false;
        this.isFormOpen = false;
        this.toast.success('Product created successfully.');
      });
    }
  }

  async deleteProduct(product: Product): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete product?',
      message: `Are you sure you want to delete "${product.name}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
    });

    if (confirmed) {
      this.productService.remove(product.id).subscribe(() => {
        this.toast.success('Product deleted.');
      });
    }
  }

  async resetToDefaults(): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Reset product catalog?',
      message: 'This will discard all admin changes and restore the original product catalog from products.json.',
      confirmLabel: 'Reset',
      danger: true,
    });

    if (confirmed) {
      this.productService.resetToDefaults().subscribe(() => {
        this.toast.success('Product catalog reset to defaults.');
      });
    }
  }

  get hasLocalOverrides(): boolean {
    return this.productService.hasLocalOverrides();
  }
}
