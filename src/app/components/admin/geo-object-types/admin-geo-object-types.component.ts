import { Component, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Store } from "@ngxs/store";
import { GeoObjectTypesState } from "../../../store/geo-object-types/geo-object-types.state";
import {
  LoadGeoObjectTypes,
  CreateGeoObjectType,
  UpdateGeoObjectType,
  DeleteGeoObjectType,
} from "../../../store/geo-object-types/geo-object-types.actions";
import { GeoObjectType } from "../../../models/admin/entities.model";
import { ConfirmDialogComponent } from "../../shared/confirm-dialog/confirm-dialog.component";
import { AdminCardComponent } from "../shared/card/admin-card.component";
import { useAdminCrud } from "../shared/use-admin-crud";

@Component({
  selector: "app-admin-geo-object-types",
  standalone: true,
  imports: [FormsModule, ConfirmDialogComponent, AdminCardComponent],
  templateUrl: "./admin-geo-object-types.component.html",
  styleUrl: "./admin-geo-object-types.component.scss",
})
export class AdminGeoObjectTypesComponent implements OnInit {
  private store = inject(Store);

  items = this.store.selectSignal(GeoObjectTypesState.items);
  loading = this.store.selectSignal(GeoObjectTypesState.loading);
  error = this.store.selectSignal(GeoObjectTypesState.error);

  formName = signal("");
  formTitle = signal("");

  crud = useAdminCrud<GeoObjectType>(
    () => ({ name: "", title: "" }),
    (item) =>
      item
        ? item.name !== this.formName() || item.title !== this.formTitle()
        : false,
  );

  ngOnInit(): void {
    this.store.dispatch(new LoadGeoObjectTypes());
  }

  selectItem(item: GeoObjectType): void {
    this.crud.selectItem(item);
    this.formName.set(item.name);
    this.formTitle.set(item.title);
  }

  openCreate(): void {
    this.crud.openCreate();
    this.formName.set("");
    this.formTitle.set("");
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
    const type: GeoObjectType = {
      id: item?.id,
      name: this.formName(),
      title: this.formTitle(),
    };

    if (this.crud.isNewItem()) {
      this.store.dispatch(new CreateGeoObjectType(type));
    } else {
      this.store.dispatch(new UpdateGeoObjectType(type));
    }

    this.crud.resetCard();
  }

  onDelete(id: number): void {
    this.crud.onDelete(id);
  }

  confirmDelete(): void {
    const id = this.crud.deleteItemId();
    if (id !== null) {
      this.store.dispatch(new DeleteGeoObjectType(id));
    }
    this.crud.confirmDelete();
  }

  cancelDelete(): void {
    this.crud.cancelDelete();
  }
}
