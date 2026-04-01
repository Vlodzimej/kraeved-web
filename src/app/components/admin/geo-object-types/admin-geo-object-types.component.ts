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
import { GeoObjectTypesState } from "../../../store/geo-object-types/geo-object-types.state";
import { GeoObjectCategoriesState } from "../../../store/geo-object-categories/geo-object-categories.state";
import {
  LoadGeoObjectTypes,
  CreateGeoObjectType,
  UpdateGeoObjectType,
  DeleteGeoObjectType,
} from "../../../store/geo-object-types/geo-object-types.actions";
import { LoadGeoObjectCategories } from "../../../store/geo-object-categories/geo-object-categories.actions";
import { GeoObjectType, GeoObjectCategory } from "../../../models/admin/entities.model";
import { ConfirmDialogComponent } from "../../shared/confirm-dialog/confirm-dialog.component";
import { AdminCardComponent } from "../shared/card/admin-card.component";
import { PaginationComponent } from "../../shared/pagination/pagination.component";
import { SortableHeaderComponent, SortDirection } from "../../shared/sortable-header/sortable-header.component";
import { useAdminCrud } from "../shared/use-admin-crud";

@Component({
  selector: "app-admin-geo-object-types",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialogComponent,
    AdminCardComponent,
    PaginationComponent,
    SortableHeaderComponent,
  ],
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

  categories = this.store.selectSignal(GeoObjectCategoriesState.items);

  searchQuery = signal("");
  currentPage = signal(1);
  pageSize = signal(10);
  sortColumn = signal<string>("id");
  sortDirection = signal<SortDirection>("asc");

  form = this.fb.group({
    name: ["", Validators.required],
    title: ["", Validators.required],
    categoryId: this.fb.control<number | null>(null),
  });

  crud = useAdminCrud<GeoObjectType>(
    () => ({ name: "", title: "" }),
    (item) => {
      if (!item) return false;
      const formValue = this.form.getRawValue();
      return (
        item.name !== formValue.name ||
        item.title !== formValue.title ||
        (item.categoryId ?? null) !== formValue.categoryId
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
        i.title.toLowerCase().includes(query),
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
    this.store.dispatch(new LoadGeoObjectCategories());
    this.store.dispatch(new LoadGeoObjectTypes());
  }

  selectItem(item: GeoObjectType): void {
    this.crud.selectItem(item);
    this.form.patchValue({
      name: item.name,
      title: item.title,
      categoryId: item.categoryId ?? null,
    });
  }

  openCreate(): void {
    this.crud.openCreate();
    this.form.reset({
      name: "",
      title: "",
      categoryId: null,
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
      categoryId: null,
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
    const selectedCategory = this.categories().find(
      (c) => c.id === formValue.categoryId,
    );
    const type: GeoObjectType = {
      id: item?.id,
      name: formValue.name,
      title: formValue.title,
      categoryId: formValue.categoryId,
      category: selectedCategory ?? null,
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

  trackCategory(_index: number, category: GeoObjectCategory): number | null {
    return category.id ?? null;
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
}
