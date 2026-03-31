import { Component, inject, OnInit, signal, computed } from "@angular/core";
import { DatePipe } from "@angular/common";
import { Store } from "@ngxs/store";
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
import { FormsModule } from "@angular/forms";
import { ConfirmDialogComponent } from "../../shared/confirm-dialog/confirm-dialog.component";
import { AdminHistoricalEventsService } from "../../../services/admin/admin-historical-events.service";
import { finalize } from "rxjs";

@Component({
  selector: "app-admin-historical-events",
  standalone: true,
  imports: [FormsModule, DatePipe, ConfirmDialogComponent],
  templateUrl: "./admin-historical-events.component.html",
  styleUrl: "./admin-historical-events.component.scss",
})
export class AdminHistoricalEventsComponent implements OnInit {
  private store = inject(Store);
  private service = inject(AdminHistoricalEventsService);

  items = this.store.selectSignal(HistoricalEventsState.items);
  loading = this.store.selectSignal(HistoricalEventsState.loading);
  error = this.store.selectSignal(HistoricalEventsState.error);

  selectedItem = signal<HistoricalEvent | null>(null);
  cardLoading = signal(false);

  formName = signal("");
  formDescription = signal("");
  formDate = signal("");
  formRegionId = signal<number | null>(null);
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
      (item.date ? item.date.substring(0, 10) : "") !== this.formDate() ||
      (item.regionId ?? null) !== this.formRegionId()
    );
  });

  ngOnInit(): void {
    this.store.dispatch(new LoadHistoricalEvents());
  }

  selectItem(item: HistoricalEventBrief): void {
    this.isNewItem.set(false);
    this.cardLoading.set(true);
    this.service
      .getById(item.id)
      .pipe(finalize(() => this.cardLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.selectedItem.set(data);
          this.formName.set(data.name);
          this.formDescription.set(data.description);
          this.formDate.set(data.date ? data.date.substring(0, 10) : "");
          this.formRegionId.set(data.regionId ?? null);
        },
      });
  }

  openCreate(): void {
    this.isNewItem.set(true);
    this.selectedItem.set({
      id: 0,
      name: "",
      description: "",
      images: [],
      thumbnail: "",
    });
    this.formName.set("");
    this.formDescription.set("");
    this.formDate.set("");
    this.formRegionId.set(null);
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
    const item: HistoricalEvent = {
      id: this.selectedItem()?.id ?? 0,
      name: this.formName(),
      description: this.formDescription(),
      date: this.formDate() || null,
      regionId: this.formRegionId(),
      images: this.selectedItem()?.images ?? [],
      thumbnail: this.selectedItem()?.thumbnail ?? "",
    };

    if (this.isNewItem()) {
      this.store.dispatch(new CreateHistoricalEvent(item));
    } else {
      this.store.dispatch(new UpdateHistoricalEvent(item));
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
      this.store.dispatch(new DeleteHistoricalEvent(id));
    }
    this.showDeleteConfirm.set(false);
    this.deleteItemId.set(null);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.deleteItemId.set(null);
  }
}
