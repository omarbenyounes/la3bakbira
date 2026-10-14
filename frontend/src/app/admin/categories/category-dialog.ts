import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AdminCatalogService } from '../../core/catalog/admin-catalog.service';
import { Category, CategoryRequest } from '../../core/catalog/catalog.models';
import { selfAndDescendantIds, toIndentedList } from '../../core/catalog/category-utils';
import { applyServerErrors } from '../../core/http/problem-detail';
import { Notifier } from '../../core/ui/notifier';

export interface CategoryDialogData {
  /** Absent = create */
  category?: Category;
  /** Pre-selected parent when creating a sub-category */
  parentId?: number | null;
  categories: Category[];
}

@Component({
  selector: 'app-category-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.category ? 'Modifier la catégorie' : 'Nouvelle catégorie' }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content class="d-flex flex-column gap-1">
        <mat-form-field>
          <mat-label>Nom</mat-label>
          <input matInput formControlName="name" required maxlength="120" />
          @if (form.controls.name.hasError('required')) { <mat-error>Le nom est obligatoire</mat-error> }
          @if (form.controls.name.hasError('server')) { <mat-error>{{ form.controls.name.getError('server') }}</mat-error> }
        </mat-form-field>

        <mat-form-field>
          <mat-label>Slug (URL)</mat-label>
          <input matInput formControlName="slug" maxlength="140" placeholder="généré à partir du nom" />
          <mat-hint>Laisser vide pour {{ data.category ? 'le conserver' : 'le générer automatiquement' }}</mat-hint>
          @if (form.controls.slug.hasError('server')) { <mat-error>{{ form.controls.slug.getError('server') }}</mat-error> }
        </mat-form-field>

        <mat-form-field>
          <mat-label>Catégorie parente</mat-label>
          <mat-select formControlName="parentId">
            <mat-option [value]="null">— Aucune (catégorie principale) —</mat-option>
            @for (option of parentOptions(); track option.category.id) {
              <mat-option [value]="option.category.id">
                {{ '   '.repeat(option.depth) }}{{ option.category.name }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>

        <div class="d-flex gap-3">
          <mat-form-field class="flex-grow-1">
            <mat-label>Ordre d'affichage</mat-label>
            <input matInput type="number" min="0" formControlName="displayOrder" />
          </mat-form-field>
          <mat-slide-toggle formControlName="active" class="align-self-center">Active</mat-slide-toggle>
        </div>

        <mat-form-field>
          <mat-label>Image (URL)</mat-label>
          <input matInput formControlName="imageUrl" maxlength="500" />
        </mat-form-field>

        <mat-form-field>
          <mat-label>Description</mat-label>
          <textarea matInput rows="3" formControlName="description" maxlength="1000"></textarea>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Annuler</button>
        <button mat-flat-button type="submit" [disabled]="saving()">Enregistrer</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `mat-dialog-content { min-width: min(480px, 80vw); }`,
})
export class CategoryDialog {
  protected readonly data = inject<CategoryDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<CategoryDialog, Category>);
  private readonly api = inject(AdminCatalogService);
  private readonly notifier = inject(Notifier);
  protected readonly saving = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: [this.data.category?.name ?? '', [Validators.required, Validators.maxLength(120)]],
    slug: [this.data.category?.slug ?? ''],
    parentId: [this.data.category ? this.data.category.parentId : (this.data.parentId ?? null)] as [number | null],
    displayOrder: [this.data.category?.displayOrder ?? 0, [Validators.min(0)]],
    active: [this.data.category?.active ?? true],
    imageUrl: [this.data.category?.imageUrl ?? ''],
    description: [this.data.category?.description ?? ''],
  });

  /** A category cannot be moved under itself or one of its own sub-categories. */
  protected readonly parentOptions = computed(() => {
    const excluded = this.data.category
      ? selfAndDescendantIds(this.data.category.id, this.data.categories)
      : new Set<number>();
    return toIndentedList(this.data.categories).filter((o) => !excluded.has(o.category.id));
  });

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const body: CategoryRequest = {
      ...value,
      slug: value.slug.trim() || null,
      imageUrl: value.imageUrl.trim() || null,
      description: value.description.trim() || null,
    };
    this.saving.set(true);
    const request = this.data.category
      ? this.api.updateCategory(this.data.category.id, body)
      : this.api.createCategory(body);
    request.subscribe({
      next: (saved) => this.dialogRef.close(saved),
      error: (err) => {
        this.saving.set(false);
        if (!applyServerErrors(err, this.form)) {
          this.notifier.error(err);
        }
      },
    });
  }
}
