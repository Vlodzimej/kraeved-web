import { Component, inject, OnInit, signal, computed } from "@angular/core";
import { Store } from "@ngxs/store";
import { GeoObjectTypesState } from "../../../store/geo-object-types/geo-object-types.state";
import {
  LoadGeoObjectTypes,
  CreateGeoObjectType,
  UpdateGeoObjectType,
  DeleteGeoObjectType,
} from "../../../store/geo-object-types/geo-object-types.actions";
import { GeoObjectType } from "../../../models/admin/entities.model";
import { FormsModule } from "@angular/forms";
import { ConfirmDialogComponent } from "../../shared/confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-admin-geo-object-types",
  standalone: true,
  imports: [FormsModule, ConfirmDialogComponent],
  templateUrl: "./admin-geo-object-types.component.html",
  styleUrl: "./admin-geo-object-types.component.scss",
})
export class AdminGeoObjectTypesComponent implements OnInit {
  private store = inject(Store);

  items = this.store.selectSignal(GeoObjectTypesState.items);
  loading = this.store.selectSignal(GeoObjectTypesState.loading);
  error = this.store.selectSignal(GeoObjectTypesState.error);

  selectedItem = signal<GeoObjectType | null>(null);
  formName = signal("");
  formTitle = signal("");
  isNewItem = signal(false);

  showDeleteConfirm = signal(false);
  deleteItemId = signal<number | null>(null);
  showCloseConfirm = signal(false);

  hasChanges = computed(() => {
    const item = this.selectedItem();
    if (!item) return false;
    return item.name !== this.formName() || item.title !== this.formTitle();
  });

  ngOnInit(): void {
    this.store.dispatch(new LoadGeoObjectTypes());
  }

  selectItem(item: GeoObjectType): void {
    this.isNewItem.set(false);
    this.selectedItem.set(item);
    this.formName.set(item.name);
    this.formTitle.set(item.title);
  }

  openCreate(): void {
    this.isNewItem.set(true);
    this.selectedItem.set({
      name: "",
      title: "",
    });
    this.formName.set("");
    this.formTitle.set("");
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
    const item: GeoObjectType = {
      id: this.selectedItem()?.id,
      name: this.formName(),
      title: this.formTitle(),
    };

    if (this.isNewItem()) {
      this.store.dispatch(new CreateGeoObjectType(item));
    } else {
      this.store.dispatch(new UpdateGeoObjectType(item));
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
      this.store.dispatch(new DeleteGeoObjectType(id));
    }
    this.showDeleteConfirm.set(false);
    this.deleteItemId.set(null);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.deleteItemId.set(null);
  }
}
