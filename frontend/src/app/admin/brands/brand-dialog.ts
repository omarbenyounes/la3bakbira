import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AdminCatalogService } from '../../core/catalog/admin-catalog.service';
import { Brand, BrandRequest } from '../../core/catalog/catalog.models';
import { applyServerErrors } from '../../core/http/problem-detail';
import { Notifier } from '../../core/ui/notifier';

@Component({
  selector: 'app-brand-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule],
  template: `
    <h2 mat-dialog-title>{{ brand ? 'Modifier la marque' : 'Nouvelle marque' }}</h2>
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
          <input matInput formControlName="slug" maxlength="140" />
          <mat-hint>Laisser vide pour {{ brand ? 'le conserver' : 'le générer automatiquement' }}</mat-hint>
          @if (form.controls.slug.hasError('server')) { <mat-error>{{ form.controls.slug.getError('server') }}</mat-error> }
        </mat-form-field>
        <mat-form-field>
          <mat-label>Logo (URL)</mat-label>
          <input matInput formControlName="logoUrl" maxlength="500" />
        </mat-form-field>
        @if (form.controls.logoUrl.value) {
          <img class="logo-preview" [src]="form.controls.logoUrl.value" alt="Aperçu du logo" />
        }
        <mat-slide-toggle formControlName="active">Active</mat-slide-toggle>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Annuler</button>
        <button mat-flat-button type="submit" [disabled]="saving()">Enregistrer</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    mat-dialog-content { min-width: min(420px, 80vw); }
    .logo-preview { max-height: 48px; max-width: 160px; object-fit: contain; margin-bottom: 0.75rem; }
  `,
})
export class BrandDialog {
  protected readonly brand = inject<Brand | undefined>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<BrandDialog, Brand>);
  private readonly api = inject(AdminCatalogService);
  private readonly notifier = inject(Notifier);
  protected readonly saving = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: [this.brand?.name ?? '', [Validators.required, Validators.maxLength(120)]],
    slug: [this.brand?.slug ?? ''],
    logoUrl: [this.brand?.logoUrl ?? ''],
    active: [this.brand?.active ?? true],
  });

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const body: BrandRequest = { ...value, slug: value.slug.trim() || null, logoUrl: value.logoUrl.trim() || null };
    this.saving.set(true);
    const request = this.brand ? this.api.updateBrand(this.brand.id, body) : this.api.createBrand(body);
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
