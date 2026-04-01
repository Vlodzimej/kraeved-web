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
import { GeoObjectCategoriesState } from "../../../store/geo-object-categories/geo-object-categories.state";
import {
  LoadGeoObjectCategories,
  CreateGeoObjectCategory,
  UpdateGeoObjectCategory,
  DeleteGeoObjectCategory,
} from "../../../store/geo-object-categories/geo-object-categories.actions";
import { GeoObjectCategory } from "../../../models/admin/entities.model";
import { ConfirmDialogComponent } from "../../shared/confirm-dialog/confirm-dialog.component";
import { AdminCardComponent } from "../shared/card/admin-card.component";
import { PaginationComponent } from "../../shared/pagination/pagination.component";
import { SortableHeaderComponent, SortDirection } from "../../shared/sortable-header/sortable-header.component";
import { useAdminCrud } from "../shared/use-admin-crud";

@Component({
  selector: "app-admin-geo-object-categories",
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
  templateUrl: "./admin-geo-object-categories.component.html",
  styleUrl: "./admin-geo-object-categories.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminGeoObjectCategoriesComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(NonNullableFormBuilder);

  items = this.store.selectSignal(GeoObjectCategoriesState.items);
  loading = this.store.selectSignal(GeoObjectCategoriesState.loading);
  error = this.store.selectSignal(GeoObjectCategoriesState.error);

  searchQuery = signal("");
  currentPage = signal(1);
  pageSize = signal(10);
  sortColumn = signal<string>("id");
  sortDirection = signal<SortDirection>("asc");

  form = this.fb.group({
    name: ["", Validators.required],
    title: ["", Validators.required],
  });

  crud = useAdminCrud<GeoObjectCategory>(
    () => ({ name: "", title: "" }),
    (item) => {
      if (!item) return false;
      const formValue = this.form.getRawValue();
      return item.name !== formValue.name || item.title !== formValue.title;
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
  }

  selectItem(item: GeoObjectCategory): void {
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
    const category: GeoObjectCategory = {
      id: item?.id,
      name: formValue.name,
      title: formValue.title,
    };

    if (this.crud.isNewItem()) {
      this.store.dispatch(new CreateGeoObjectCategory(category));
    } else {
      this.store.dispatch(new UpdateGeoObjectCategory(category));
    }

    this.crud.resetCard();
  }

  onDelete(id: number): void {
    this.crud.onDelete(id);
  }

  confirmDelete(): void {
    const id = this.crud.deleteItemId();
    if (id !== null) {
      this.store.dispatch(new DeleteGeoObjectCategory(id));
    }
    this.crud.confirmDelete();
  }

  cancelDelete(): void {
    this.crud.cancelDelete();
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
