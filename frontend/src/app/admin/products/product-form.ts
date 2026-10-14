import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminCatalogService } from '../../core/catalog/admin-catalog.service';
import { Brand, Category, Product, ProductRequest } from '../../core/catalog/catalog.models';
import { toIndentedList } from '../../core/catalog/category-utils';
import { applyServerErrors } from '../../core/http/problem-detail';
import { Notifier } from '../../core/ui/notifier';

/** Group validator: a discount price must be strictly lower than the price. */
export function discountLowerThanPrice(group: AbstractControl): ValidationErrors | null {
  const price = group.get('price')?.value;
  const discount = group.get('discountPrice')?.value;
  return price != null && discount != null && discount !== '' && Number(discount) >= Number(price)
    ? { discountTooHigh: true }
    : null;
}

@Component({
  selector: 'app-product-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTooltipModule,
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm implements OnInit {
  /** Route parameter; absent on /admin/produits/nouveau */
  readonly id = input<string>();

  private readonly api = inject(AdminCatalogService);
  private readonly notifier = inject(Notifier);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly isEdit = computed(() => !!this.id());
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly categoryOptions = signal(toIndentedList([]));
  protected readonly brands = signal<Brand[]>([]);

  protected readonly form = this.fb.group(
    {
      name: ['', [Validators.required, Validators.maxLength(200)]],
      slug: ['', Validators.maxLength(220)],
      sku: ['', [Validators.required, Validators.maxLength(64)]],
      shortDescription: ['', Validators.maxLength(500)],
      description: [''],
      price: [null as number | null, [Validators.required, Validators.min(0)]],
      discountPrice: [null as number | null, Validators.min(0)],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      categoryId: [null as number | null, Validators.required],
      brandId: [null as number | null],
      active: [true],
      featured: [false],
      images: this.fb.array<FormGroup>([]),
      specs: this.fb.array<FormGroup>([]),
    },
    { validators: discountLowerThanPrice },
  );

  protected get images(): FormArray<FormGroup> {
    return this.form.controls.images;
  }

  protected get specs(): FormArray<FormGroup> {
    return this.form.controls.specs;
  }

  ngOnInit(): void {
    this.api.listCategories().subscribe((cats: Category[]) => this.categoryOptions.set(toIndentedList(cats)));
    this.api.listBrands().subscribe((brands) => this.brands.set(brands));

    const id = this.id();
    if (id) {
      this.loading.set(true);
      this.api.getProduct(Number(id)).subscribe({
        next: (product) => {
          this.fill(product);
          this.loading.set(false);
        },
        error: (err) => {
          this.notifier.error(err);
          this.router.navigate(['/admin/produits']);
        },
      });
    }
  }

  protected addImage(url = '', altText = ''): void {
    this.images.push(
      this.fb.group({
        // updateOn blur: the preview loads the finished URL, not every partial URL while typing
        url: this.fb.control(url, { validators: [Validators.required, Validators.maxLength(500)], updateOn: 'blur' }),
        altText: [altText],
      }),
    );
  }

  protected addSpec(name = '', value = ''): void {
    this.specs.push(
      this.fb.group({
        name: [name, [Validators.required, Validators.maxLength(100)]],
        value: [value, [Validators.required, Validators.maxLength(500)]],
      }),
    );
  }

  /** Moves an image so the chosen one can become the main (first) image. */
  protected moveImage(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= this.images.length) return;
    const control = this.images.at(index);
    this.images.removeAt(index);
    this.images.insert(target, control);
  }

  protected indent(depth: number): string {
    return '   '.repeat(depth);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notifier.error('Corrigez les champs en rouge avant d’enregistrer.');
      return;
    }
    const v = this.form.getRawValue();
    const body: ProductRequest = {
      name: v.name.trim(),
      slug: v.slug.trim() || null,
      sku: v.sku.trim(),
      shortDescription: v.shortDescription.trim() || null,
      description: v.description.trim() || null,
      price: v.price!,
      discountPrice: v.discountPrice ?? null,
      stockQuantity: v.stockQuantity,
      categoryId: v.categoryId!,
      brandId: v.brandId,
      active: v.active,
      featured: v.featured,
      images: v.images.map((i) => ({ url: i['url'].trim(), altText: i['altText']?.trim() || null })),
      specs: v.specs.map((s) => ({ name: s['name'].trim(), value: s['value'].trim() })),
    };

    this.saving.set(true);
    const id = this.id();
    const request = id ? this.api.updateProduct(Number(id), body) : this.api.createProduct(body);
    request.subscribe({
      next: () => {
        this.notifier.success(id ? 'Produit modifié' : 'Produit créé');
        this.router.navigate(['/admin/produits']);
      },
      error: (err) => {
        this.saving.set(false);
        applyServerErrors(err, this.form);
        this.notifier.error(err);
      },
    });
  }

  private fill(product: Product): void {
    this.form.patchValue({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      shortDescription: product.shortDescription ?? '',
      description: product.description ?? '',
      price: product.price,
      discountPrice: product.discountPrice,
      stockQuantity: product.stockQuantity,
      categoryId: product.category.id,
      brandId: product.brand?.id ?? null,
      active: product.active,
      featured: product.featured,
    });
    this.images.clear();
    product.images.forEach((i) => this.addImage(i.url, i.altText ?? ''));
    this.specs.clear();
    product.specs.forEach((s) => this.addSpec(s.name, s.value));
  }
}
