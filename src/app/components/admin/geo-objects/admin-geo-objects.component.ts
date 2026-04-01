import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Store } from "@ngxs/store";
import { finalize } from "rxjs";
import { GeoObjectsState } from "../../../store/geo-objects/geo-objects.state";
import {
  LoadGeoObjects,
  CreateGeoObject,
  UpdateGeoObject,
  DeleteGeoObject,
} from "../../../store/geo-objects/geo-objects.actions";
import {
  GeoObject,
  GeoObjectBrief,
} from "../../../models/admin/entities.model";
import { AdminGeoObjectsService } from "../../../services/admin/admin-geo-objects.service";
import { ConfirmDialogComponent } from "../../shared/confirm-dialog/confirm-dialog.component";
import { AdminCardComponent } from "../shared/card/admin-card.component";
import { useAdminCrud } from "../shared/use-admin-crud";

@Component({
  selector: "app-admin-geo-objects",
  standalone: true,
  imports: [ReactiveFormsModule, ConfirmDialogComponent, AdminCardComponent],
  templateUrl: "./admin-geo-objects.component.html",
  styleUrl: "./admin-geo-objects.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminGeoObjectsComponent implements OnInit {
  private store = inject(Store);
  private service = inject(AdminGeoObjectsService);
  private fb = inject(NonNullableFormBuilder);

  items = this.store.selectSignal(GeoObjectsState.items);
  loading = this.store.selectSignal(GeoObjectsState.loading);
  error = this.store.selectSignal(GeoObjectsState.error);

  cardLoading = signal(false);

  form = this.fb.group({
    name: ["", Validators.required],
    description: [""],
    shortDescription: [""],
    latitude: this.fb.control<number | null>(null),
    longitude: this.fb.control<number | null>(null),
    regionId: this.fb.control<number | null>(null),
    typeId: this.fb.control<number | null>(null),
  });

  crud = useAdminCrud<GeoObject>(
    () => ({
      name: "",
      description: "",
      shortDescription: "",
      images: [],
      thumbnail: "",
    }),
    (item) => {
      if (!item) return false;
      const formValue = this.form.getRawValue();
      return (
        item.name !== formValue.name ||
        item.description !== formValue.description ||
        item.shortDescription !== formValue.shortDescription ||
        (item.latitude ?? null) !== formValue.latitude ||
        (item.longitude ?? null) !== formValue.longitude ||
        (item.regionId ?? null) !== formValue.regionId ||
        (item.typeId ?? null) !== formValue.typeId
      );
    },
  );

  ngOnInit(): void {
    this.store.dispatch(new LoadGeoObjects());
  }

  selectItem(item: GeoObjectBrief): void {
    this.crud.isNewItem.set(false);
    this.cardLoading.set(true);
    this.service
      .getById(item.id!)
      .pipe(finalize(() => this.cardLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.crud.selectItem(data);
          this.form.patchValue({
            name: data.name,
            description: data.description,
            shortDescription: data.shortDescription,
            latitude: data.latitude ?? null,
            longitude: data.longitude ?? null,
            regionId: data.regionId ?? null,
            typeId: data.typeId ?? null,
          });
        },
      });
  }

  openCreate(): void {
    this.crud.openCreate();
    this.form.reset({
      name: "",
      description: "",
      shortDescription: "",
      latitude: null,
      longitude: null,
      regionId: null,
      typeId: null,
    });
  }

  closeCard(): void {
    this.crud.closeCard();
  }

  confirmClose(): void {
    this.crud.confirmClose();
    this.form.reset({
      name: "",
      description: "",
      shortDescription: "",
      latitude: null,
      longitude: null,
      regionId: null,
      typeId: null,
    });
  }

  cancelClose(): void {
    this.crud.cancelClose();
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const item = this.crud.selectedItem();
    const formValue = this.form.getRawValue();
    const geoObject: GeoObject = {
      id: item?.id,
      name: formValue.name,
      description: formValue.description,
      shortDescription: formValue.shortDescription,
      latitude: formValue.latitude,
      longitude: formValue.longitude,
      regionId: formValue.regionId,
      typeId: formValue.typeId,
    };

    if (this.crud.isNewItem()) {
      this.store.dispatch(new CreateGeoObject(geoObject));
    } else {
      this.store.dispatch(new UpdateGeoObject(geoObject));
    }

    this.crud.resetCard();
  }

  onDelete(id: number): void {
    this.crud.onDelete(id);
  }

  confirmDelete(): void {
    const id = this.crud.deleteItemId();
    if (id !== null) {
      this.store.dispatch(new DeleteGeoObject(id));
    }
    this.crud.confirmDelete();
  }

  cancelDelete(): void {
    this.crud.cancelDelete();
  }
}
