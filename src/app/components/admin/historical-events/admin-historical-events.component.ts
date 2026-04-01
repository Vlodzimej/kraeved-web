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
import { HistoricalEventsState } from "../../../store/historical-events/historical-events.state";
import {
  LoadHistoricalEvents,
  CreateHistoricalEvent,
  UpdateHistoricalEvent,
  DeleteHistoricalEvent,
} from "../../../store/historical-events/historical-events.actions";
import {
  HistoricalEvent,
  HistoricalEventBrief,
} from "../../../models/admin/entities.model";
import { AdminHistoricalEventsService } from "../../../services/admin/admin-historical-events.service";
import { ConfirmDialogComponent } from "../../shared/confirm-dialog/confirm-dialog.component";
import { AdminCardComponent } from "../shared/card/admin-card.component";
import { PaginationComponent } from "../../shared/pagination/pagination.component";
import { SortableHeaderComponent, SortDirection } from "../../shared/sortable-header/sortable-header.component";
import { useAdminCrud } from "../shared/use-admin-crud";

const DEFAULT_REGION_ID = 40;

@Component({
  selector: "app-admin-historical-events",
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
  templateUrl: "./admin-historical-events.component.html",
  styleUrl: "./admin-historical-events.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHistoricalEventsComponent implements OnInit {
  private store = inject(Store);
  private service = inject(AdminHistoricalEventsService);
  private fb = inject(NonNullableFormBuilder);

  items = this.store.selectSignal(HistoricalEventsState.items);
  loading = this.store.selectSignal(HistoricalEventsState.loading);
  error = this.store.selectSignal(HistoricalEventsState.error);

  cardLoading = signal(false);

  searchQuery = signal("");
  currentPage = signal(1);
  pageSize = signal(10);
  sortColumn = signal<string>("id");
  sortDirection = signal<SortDirection>("asc");

  form = this.fb.group({
    name: ["", Validators.required],
    description: [""],
    date: [""],
    regionId: this.fb.control<number | null>({ value: DEFAULT_REGION_ID, disabled: true }),
  });

  crud = useAdminCrud<HistoricalEvent>(
    () => ({ id: 0, name: "", description: "", date: null, images: [], thumbnail: "" }),
    (item) => {
      if (!item) return false;
      const formValue = this.form.getRawValue();
      return (
        item.name !== formValue.name ||
        item.description !== formValue.description ||
        (item.date ? item.date.substring(0, 10) : "") !== formValue.date ||
        (item.regionId ?? null) !== formValue.regionId
      );
    },
  );

  filteredItems = computed(() => {
    const items = this.items();
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(query),
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
    this.store.dispatch(new LoadHistoricalEvents());
  }

  selectItem(item: HistoricalEvent): void {
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
            date: data.date ? data.date.substring(0, 10) : "",
            regionId: data.regionId ?? null,
          });
        },
      });
  }

  openCreate(): void {
    this.crud.openCreate();
    this.form.reset({
      name: "",
      description: "",
      date: "",
      regionId: DEFAULT_REGION_ID,
    });
    this.form.controls.regionId.disable();
  }

  closeCard(): void {
    this.crud.closeCard();
  }

  confirmClose(): void {
    this.crud.confirmClose();
    this.form.reset({
      name: "",
      description: "",
      date: "",
      regionId: null,
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
    const event: HistoricalEvent = {
      id: item?.id ?? 0,
      name: formValue.name,
      description: formValue.description,
      date: formValue.date || null,
      regionId: formValue.regionId,
      images: item?.images ?? [],
      thumbnail: item?.thumbnail ?? "",
    };

    if (this.crud.isNewItem()) {
      this.store.dispatch(new CreateHistoricalEvent(event));
    } else {
      this.store.dispatch(new UpdateHistoricalEvent(event));
    }

    this.crud.resetCard();
  }

  onDelete(id: number): void {
    this.crud.onDelete(id);
  }

  confirmDelete(): void {
    const id = this.crud.deleteItemId();
    if (id !== null) {
      this.store.dispatch(new DeleteHistoricalEvent(id));
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
