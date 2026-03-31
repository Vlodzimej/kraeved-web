import { Component, inject, OnInit, signal, computed } from "@angular/core";
import { Store } from "@ngxs/store";
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
import { FormsModule } from "@angular/forms";
import { ConfirmDialogComponent } from "../../shared/confirm-dialog/confirm-dialog.component";
import { AdminGeoObjectsService } from "../../../services/admin/admin-geo-objects.service";
import { finalize } from "rxjs";

@Component({
  selector: "app-admin-geo-objects",
  standalone: true,
  imports: [FormsModule, ConfirmDialogComponent],
  templateUrl: "./admin-geo-objects.component.html",
  styleUrl: "./admin-geo-objects.component.scss",
})
export class AdminGeoObjectsComponent implements OnInit {
  private store = inject(Store);
  private service = inject(AdminGeoObjectsService);

  items = this.store.selectSignal(GeoObjectsState.items);
  loading = this.store.selectSignal(GeoObjectsState.loading);
  error = this.store.selectSignal(GeoObjectsState.error);

  selectedItem = signal<GeoObject | null>(null);
  cardLoading = signal(false);

  formName = signal("");
  formDescription = signal("");
  formShortDescription = signal("");
  formLatitude = signal<number | null>(null);
  formLongitude = signal<number | null>(null);
  formRegionId = signal<number | null>(null);
  formTypeId = signal<number | null>(null);
  isNewItem = signal(false);

  showDeleteConfirm = signal(false);
  deleteItemId = signal<number | null>(null);

  showCloseConfirm = signal(false);

  hasChanges = computed(() => {
    const item = this.selectedItem();
    if (!item) return false;
    return (
      item.name !== this.formName() ||
      item.description !== this.formDescription() ||
      item.shortDescription !== this.formShortDescription() ||
      (item.latitude ?? null) !== this.formLatitude() ||
      (item.longitude ?? null) !== this.formLongitude() ||
      (item.regionId ?? null) !== this.formRegionId() ||
      (item.typeId ?? null) !== this.formTypeId()
    );
  });

  ngOnInit(): void {
    this.store.dispatch(new LoadGeoObjects());
  }

  selectItem(item: GeoObjectBrief): void {
    this.isNewItem.set(false);
    this.cardLoading.set(true);
    this.service
      .getById(item.id!)
      .pipe(finalize(() => this.cardLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.selectedItem.set(data);
          this.formName.set(data.name);
          this.formDescription.set(data.description);
          this.formShortDescription.set(data.shortDescription);
          this.formLatitude.set(data.latitude ?? null);
          this.formLongitude.set(data.longitude ?? null);
          this.formRegionId.set(data.regionId ?? null);
          this.formTypeId.set(data.typeId ?? null);
        },
      });
  }

  openCreate(): void {
    this.isNewItem.set(true);
    this.selectedItem.set({
      name: "",
      description: "",
      shortDescription: "",
    });
    this.formName.set("");
    this.formDescription.set("");
    this.formShortDescription.set("");
    this.formLatitude.set(null);
    this.formLongitude.set(null);
    this.formRegionId.set(null);
    this.formTypeId.set(null);
  }

  closeCard(): void {
    if (this.hasChanges()) {
      this.showCloseConfirm.set(true);
    } else {
      this.selectedItem.set(null);
    }
  }

  confirmClose(): void {
    this.showCloseConfirm.set(false);
    this.selectedItem.set(null);
  }

  cancelClose(): void {
    this.showCloseConfirm.set(false);
  }

  onSave(): void {
    const geoObject: GeoObject = {
      id: this.selectedItem()?.id,
      name: this.formName(),
      description: this.formDescription(),
      shortDescription: this.formShortDescription(),
      latitude: this.formLatitude(),
      longitude: this.formLongitude(),
      regionId: this.formRegionId(),
      typeId: this.formTypeId(),
    };

    if (this.isNewItem()) {
      this.store.dispatch(new CreateGeoObject(geoObject));
    } else {
      this.store.dispatch(new UpdateGeoObject(geoObject));
    }

    this.selectedItem.set(null);
  }

  onDelete(id: number): void {
    this.deleteItemId.set(id);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    const id = this.deleteItemId();
    if (id !== null) {
      this.store.dispatch(new DeleteGeoObject(id));
    }
    this.showDeleteConfirm.set(false);
    this.deleteItemId.set(null);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.deleteItemId.set(null);
  }
}
