import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { DatePipe } from "@angular/common";
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
  imports: [DatePipe, ReactiveFormsModule, ConfirmDialogComponent, AdminCardComponent],
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

  form = this.fb.group({
    name: ["", Validators.required],
    description: [""],
    date: [""],
    regionId: this.fb.control<number | null>(null),
  });

  crud = useAdminCrud<HistoricalEvent>(
    () => ({ id: 0, name: "", description: "", images: [], thumbnail: "" }),
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
      regionId: null,
    });
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
}
