import { Injectable, inject } from "@angular/core";
import { State, Selector, Action, StateContext } from "@ngxs/store";
import { tap, catchError } from "rxjs";
import { AdminGeoObjectTypesService } from "../../services/admin/admin-geo-object-types.service";
import {
  LoadGeoObjectTypes,
  CreateGeoObjectType,
  UpdateGeoObjectType,
  DeleteGeoObjectType,
} from "./geo-object-types.actions";
import {
  GeoObjectTypesStateModel,
  geoObjectTypesStateDefaults,
} from "./geo-object-types.model";
import { getBackendErrorMessage } from "../../utils/error-messages";

@State<GeoObjectTypesStateModel>({
  name: "geoObjectTypes",
  defaults: geoObjectTypesStateDefaults,
})
@Injectable()
export class GeoObjectTypesState {
  @Selector()
  static items(state: GeoObjectTypesStateModel) {
    return state.items;
  }

  @Selector()
  static loading(state: GeoObjectTypesStateModel) {
    return state.loading;
  }

  @Selector()
  static error(state: GeoObjectTypesStateModel) {
    return state.error;
  }

  private service = inject(AdminGeoObjectTypesService);

  @Action(LoadGeoObjectTypes)
  load(ctx: StateContext<GeoObjectTypesStateModel>) {
    ctx.patchState({ loading: true, error: null });
    return this.service.getAll().pipe(
      tap((items) => {
        ctx.patchState({ items, loading: false });
      }),
      catchError((err) => {
        ctx.patchState({ loading: false, error: getBackendErrorMessage(err.message) });
        throw err;
      }),
    );
  }

  @Action(CreateGeoObjectType)
  create(
    ctx: StateContext<GeoObjectTypesStateModel>,
    { item }: CreateGeoObjectType,
  ) {
    const state = ctx.getState();
    ctx.patchState({ loading: true, error: null });

    return this.service.create(item).pipe(
      tap((createdItem) => {
        ctx.patchState({
          items: [...state.items, createdItem],
          loading: false,
        });
      }),
      catchError((err) => {
        ctx.patchState({ loading: false, error: getBackendErrorMessage(err.message) });
        throw err;
      }),
    );
  }

  @Action(UpdateGeoObjectType)
  update(
    ctx: StateContext<GeoObjectTypesStateModel>,
    { item }: UpdateGeoObjectType,
  ) {
    const state = ctx.getState();
    ctx.patchState({ loading: true, error: null });

    return this.service.update(item).pipe(
      tap((updatedItem) => {
        ctx.patchState({
          items: state.items.map((i) => (i.id === updatedItem.id ? updatedItem : i)),
          loading: false,
        });
      }),
      catchError((err) => {
        ctx.patchState({ loading: false, error: getBackendErrorMessage(err.message) });
        throw err;
      }),
    );
  }

  @Action(DeleteGeoObjectType)
  delete(
    ctx: StateContext<GeoObjectTypesStateModel>,
    { id }: DeleteGeoObjectType,
  ) {
    const state = ctx.getState();
    ctx.patchState({ loading: true, error: null });

    return this.service.delete(id).pipe(
      tap(() => {
        ctx.patchState({
          items: state.items.filter((i) => i.id !== id),
          loading: false,
        });
      }),
      catchError((err) => {
        ctx.patchState({ loading: false, error: getBackendErrorMessage(err.message) });
        throw err;
      }),
    );
  }
}
