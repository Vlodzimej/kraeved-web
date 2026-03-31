import { Injectable, inject } from "@angular/core";
import { State, Selector, Action, StateContext } from "@ngxs/store";
import { tap, catchError } from "rxjs";
import { AdminHistoricalEventsService } from "../../services/admin/admin-historical-events.service";
import {
  LoadHistoricalEvents,
  CreateHistoricalEvent,
  UpdateHistoricalEvent,
  DeleteHistoricalEvent,
} from "./historical-events.actions";
import {
  HistoricalEventsStateModel,
  historicalEventsStateDefaults,
} from "./historical-events.model";

@State<HistoricalEventsStateModel>({
  name: "historicalEvents",
  defaults: historicalEventsStateDefaults,
})
@Injectable()
export class HistoricalEventsState {
  @Selector()
  static items(state: HistoricalEventsStateModel) {
    return state.items;
  }

  @Selector()
  static loading(state: HistoricalEventsStateModel) {
    return state.loading;
  }

  @Selector()
  static error(state: HistoricalEventsStateModel) {
    return state.error;
  }

  private service = inject(AdminHistoricalEventsService);

  @Action(LoadHistoricalEvents)
  load(ctx: StateContext<HistoricalEventsStateModel>) {
    ctx.patchState({ loading: true, error: null });
    return this.service.getAll().pipe(
      tap((items) => {
        ctx.patchState({ items, loading: false });
      }),
      catchError((err) => {
        ctx.patchState({ loading: false, error: err.message });
        throw err;
      }),
    );
  }

  @Action(CreateHistoricalEvent)
  create(
    ctx: StateContext<HistoricalEventsStateModel>,
    { item }: CreateHistoricalEvent,
  ) {
    return this.service.create(item).pipe(
      tap(() => {
        ctx.dispatch(new LoadHistoricalEvents());
      }),
    );
  }

  @Action(UpdateHistoricalEvent)
  update(
    ctx: StateContext<HistoricalEventsStateModel>,
    { item }: UpdateHistoricalEvent,
  ) {
    return this.service.update(item).pipe(
      tap(() => {
        ctx.dispatch(new LoadHistoricalEvents());
      }),
    );
  }

  @Action(DeleteHistoricalEvent)
  delete(
    ctx: StateContext<HistoricalEventsStateModel>,
    { id }: DeleteHistoricalEvent,
  ) {
    return this.service.delete(id).pipe(
      tap(() => {
        ctx.dispatch(new LoadHistoricalEvents());
      }),
    );
  }
}
