import { Component, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
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
  imports: [FormsModule, ConfirmDialogComponent, AdminCardComponent],
  templateUrl: "./admin-geo-objects.component.html",
  styleUrl: "./admin-geo-objects.component.scss",
})
export class AdminGeoObjectsComponent implements OnInit {
  private store = inject(Store);
  private service = inject(AdminGeoObjectsService);

  items = this.store.selectSignal(GeoObjectsState.items);
  loading = this.store.selectSignal(GeoObjectsState.loading);
  error = this.store.selectSignal(GeoObjectsState.error);

  cardLoading = signal(false);

  formName = signal("");
  formDescription = signal("");
  formShortDescription = signal("");
  formLatitude = signal<number | null>(null);
  formLongitude = signal<number | null>(null);
  formRegionId = signal<number | null>(null);
  formTypeId = signal<number | null>(null);

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
      return (
        item.name !== this.formName() ||
        item.description !== this.formDescription() ||
        item.shortDescription !== this.formShortDescription() ||
        (item.latitude ?? null) !== this.formLatitude() ||
        (item.longitude ?? null) !== this.formLongitude() ||
        (item.regionId ?? null) !== this.formRegionId() ||
        (item.typeId ?? null) !== this.formTypeId()
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
    this.crud.openCreate();
    this.formName.set("");
    this.formDescription.set("");
    this.formShortDescription.set("");
    this.formLatitude.set(null);
    this.formLongitude.set(null);
    this.formRegionId.set(null);
    this.formTypeId.set(null);
  }

  closeCard(): void {
    this.crud.closeCard();
  }

  confirmClose(): void {
    this.crud.confirmClose();
  }

  cancelClose(): void {
    this.crud.cancelClose();
  }

  onSave(): void {
    const item = this.crud.selectedItem();
    const geoObject: GeoObject = {
      id: item?.id,
      name: this.formName(),
      description: this.formDescription(),
      shortDescription: this.formShortDescription(),
      latitude: this.formLatitude(),
      longitude: this.formLongitude(),
      regionId: this.formRegionId(),
      typeId: this.formTypeId(),
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
