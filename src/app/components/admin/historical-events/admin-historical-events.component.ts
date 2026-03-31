import { Component, inject, OnInit, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
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
import { useAdminCrud } from "../shared/use-admin-crud";

@Component({
  selector: "app-admin-historical-events",
  standalone: true,
  imports: [DatePipe, FormsModule, ConfirmDialogComponent, AdminCardComponent],
  templateUrl: "./admin-historical-events.component.html",
  styleUrl: "./admin-historical-events.component.scss",
})
export class AdminHistoricalEventsComponent implements OnInit {
  private store = inject(Store);
  private service = inject(AdminHistoricalEventsService);

  items = this.store.selectSignal(HistoricalEventsState.items);
  loading = this.store.selectSignal(HistoricalEventsState.loading);
  error = this.store.selectSignal(HistoricalEventsState.error);

  cardLoading = signal(false);

  formName = signal("");
  formDescription = signal("");
  formDate = signal("");
  formRegionId = signal<number | null>(null);

  crud = useAdminCrud<HistoricalEvent>(
    () => ({ id: 0, name: "", description: "", images: [], thumbnail: "" }),
    (item) => {
      if (!item) return false;
      return (
        item.name !== this.formName() ||
        item.description !== this.formDescription() ||
        (item.date ? item.date.substring(0, 10) : "") !== this.formDate() ||
        (item.regionId ?? null) !== this.formRegionId()
      );
    },
  );

  ngOnInit(): void {
    this.store.dispatch(new LoadHistoricalEvents());
  }

  selectItem(item: HistoricalEventBrief): void {
    this.crud.isNewItem.set(false);
    this.cardLoading.set(true);
    this.service
      .getById(item.id)
      .pipe(finalize(() => this.cardLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.crud.selectItem(data);
          this.formName.set(data.name);
          this.formDescription.set(data.description);
          this.formDate.set(data.date ? data.date.substring(0, 10) : "");
          this.formRegionId.set(data.regionId ?? null);
        },
      });
  }

  openCreate(): void {
    this.crud.openCreate();
    this.formName.set("");
    this.formDescription.set("");
    this.formDate.set("");
    this.formRegionId.set(null);
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
    const event: HistoricalEvent = {
      id: item?.id ?? 0,
      name: this.formName(),
      description: this.formDescription(),
      date: this.formDate() || null,
      regionId: this.formRegionId(),
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
}
