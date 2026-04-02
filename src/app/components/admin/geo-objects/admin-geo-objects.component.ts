import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { GeoObjectTypesState } from "../../../store/geo-object-types/geo-object-types.state";
import {
  LoadGeoObjects,
  CreateGeoObject,
  UpdateGeoObject,
  DeleteGeoObject,
} from "../../../store/geo-objects/geo-objects.actions";
import { LoadGeoObjectTypes } from "../../../store/geo-object-types/geo-object-types.actions";
import {
  GeoObject,
  GeoObjectBrief,
  GeoObjectType,
} from "../../../models/admin/entities.model";
import { AdminGeoObjectsService } from "../../../services/admin/admin-geo-objects.service";
import { ConfirmDialogComponent } from "../../shared/confirm-dialog/confirm-dialog.component";
import { AdminCardComponent } from "../shared/card/admin-card.component";
import { PaginationComponent } from "../../shared/pagination/pagination.component";
import { SortableHeaderComponent, SortDirection } from "../../shared/sortable-header/sortable-header.component";
import { ImageUploaderComponent } from "../../shared/image-uploader/image-uploader.component";
import { useAdminCrud } from "../shared/use-admin-crud";

const DEFAULT_REGION_ID = 40;

@Component({
  selector: "app-admin-geo-objects",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialogComponent,
    AdminCardComponent,
    PaginationComponent,
    SortableHeaderComponent,
    ImageUploaderComponent,
  ],
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

  types = this.store.selectSignal(GeoObjectTypesState.items);

  cardLoading = signal(false);

  images = signal<string[]>([]);

  searchQuery = signal("");
  currentPage = signal(1);
  pageSize = signal(10);
  sortColumn = signal<string>("id");
  sortDirection = signal<SortDirection>("asc");

  form = this.fb.group({
    name: ["", Validators.required],
    description: [""],
    shortDescription: [""],
    coordinates: this.fb.control<string>(""),
    regionId: this.fb.control<number | null>({ value: DEFAULT_REGION_ID, disabled: true }),
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
      const coords = formValue.coordinates.split(",").map((s) => s.trim());
      const formLat = coords[0] ? parseFloat(coords[0]) : null;
      const formLng = coords[1] ? parseFloat(coords[1]) : null;
      return (
        item.name !== formValue.name ||
        item.description !== formValue.description ||
        item.shortDescription !== formValue.shortDescription ||
        (item.latitude ?? null) !== formLat ||
        (item.longitude ?? null) !== formLng ||
        (item.regionId ?? null) !== formValue.regionId ||
        (item.typeId ?? null) !== formValue.typeId
      );
    },
  );

  filteredItems = computed(() => {
    const items = this.items();
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(query) ||
        (i.shortDescription?.toLowerCase().includes(query) ?? false) ||
        (i.typeTitle?.toLowerCase().includes(query) ?? false),
    );
  });

  sortedItems = computed(() => {
    const items = [...this.filteredItems()];
    const column = this.sortColumn();
    const dir = this.sortDirection();
    if (!dir) return items;

    items.sort((a, b) => {
      const valA = (a as unknown as Record<string, unknown>)[column];
      const valB = (b as unknown as Record<string, unknown>)[column];
      if (valA == null && valB == null) return 0;
      if (valA == null) return dir === "asc" ? -1 : 1;
      if (valB == null) return dir === "asc" ? 1 : -1;
      if (typeof valA === "number" && typeof valB === "number") {
        return dir === "asc" ? valA - valB : valB - valA;
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return dir === "asc"
        ? strA.localeCompare(strB, "ru")
        : strB.localeCompare(strA, "ru");
    });

    return items;
  });

  pagedItems = computed(() => {
    const items = this.sortedItems();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return items.slice(start, start + size);
  });

  totalFilteredItems = computed(() => this.filteredItems().length);

  ngOnInit(): void {
    this.store.dispatch(new LoadGeoObjectTypes());
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
          this.images.set(data.images ?? []);
          this.form.patchValue({
            name: data.name,
            description: data.description,
            shortDescription: data.shortDescription,
            coordinates: data.latitude != null && data.longitude != null
              ? `${data.latitude}, ${data.longitude}`
              : "",
            regionId: data.regionId ?? null,
            typeId: data.typeId ?? null,
          });
        },
      });
  }

  openCreate(): void {
    this.crud.openCreate();
    this.images.set([]);
    this.form.reset({
      name: "",
      description: "",
      shortDescription: "",
      coordinates: "",
      regionId: DEFAULT_REGION_ID,
      typeId: null,
    });
  }

  closeCard(): void {
    this.crud.closeCard();
  }

  confirmClose(): void {
    this.crud.confirmClose();
    this.images.set([]);
    this.form.reset({
      name: "",
      description: "",
      shortDescription: "",
      coordinates: "",
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
    const coords = formValue.coordinates.split(",").map((s) => s.trim());
    const imgs = this.images();
    const geoObject: GeoObject = {
      id: item?.id,
      name: formValue.name,
      description: formValue.description,
      shortDescription: formValue.shortDescription,
      latitude: coords[0] ? parseFloat(coords[0]) : null,
      longitude: coords[1] ? parseFloat(coords[1]) : null,
      regionId: formValue.regionId,
      typeId: formValue.typeId,
      images: imgs.length > 0 ? imgs : null,
      thumbnail: imgs.length > 0 ? imgs[0] : null,
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

  trackType(_index: number, type: GeoObjectType): number | null {
    return type.id ?? null;
  }

  onSort({ column, direction }: { column: string; direction: SortDirection }): void {
    this.sortColumn.set(column);
    this.sortDirection.set(direction);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onImagesChange(images: string[]): void {
    this.images.set(images);
  }
}
