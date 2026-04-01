import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from "@angular/core";
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
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
  imports: [ReactiveFormsModule, ConfirmDialogComponent, AdminCardComponent],
  templateUrl: "./admin-geo-object-types.component.html",
  styleUrl: "./admin-geo-object-types.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminGeoObjectTypesComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(NonNullableFormBuilder);

  items = this.store.selectSignal(GeoObjectTypesState.items);
  loading = this.store.selectSignal(GeoObjectTypesState.loading);
  error = this.store.selectSignal(GeoObjectTypesState.error);

  form = this.fb.group({
    name: ["", Validators.required],
    title: ["", Validators.required],
  });

  crud = useAdminCrud<GeoObjectType>(
    () => ({ name: "", title: "" }),
    (item) => {
      if (!item) return false;
      const formValue = this.form.getRawValue();
      return item.name !== formValue.name || item.title !== formValue.title;
    },
  );

  ngOnInit(): void {
    this.store.dispatch(new LoadGeoObjectTypes());
  }

  selectItem(item: GeoObjectType): void {
    this.crud.selectItem(item);
    this.form.patchValue({
      name: item.name,
      title: item.title,
    });
  }

  openCreate(): void {
    this.crud.openCreate();
    this.form.reset({
      name: "",
      title: "",
    });
  }

  closeCard(): void {
    this.crud.closeCard();
  }

  confirmClose(): void {
    this.crud.confirmClose();
    this.form.reset({
      name: "",
      title: "",
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
    const type: GeoObjectType = {
      id: item?.id,
      name: formValue.name,
      title: formValue.title,
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
