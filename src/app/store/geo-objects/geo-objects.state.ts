import { Injectable, inject } from "@angular/core";
import { State, Selector, Action, StateContext } from "@ngxs/store";
import { tap, catchError } from "rxjs";
import { AdminGeoObjectsService } from "../../services/admin/admin-geo-objects.service";
import {
  LoadGeoObjects,
  CreateGeoObject,
  UpdateGeoObject,
  DeleteGeoObject,
} from "./geo-objects.actions";
import {
  GeoObjectsStateModel,
  geoObjectsStateDefaults,
} from "./geo-objects.model";
import { GeoObjectBrief } from "../../models/admin/entities.model";

@State<GeoObjectsStateModel>({
  name: "geoObjects",
  defaults: geoObjectsStateDefaults,
})
@Injectable()
export class GeoObjectsState {
  @Selector()
  static items(state: GeoObjectsStateModel) {
    return state.items;
  }

  @Selector()
  static selectedItem(state: GeoObjectsStateModel) {
    return state.selectedItem;
  }

  @Selector()
  static loading(state: GeoObjectsStateModel) {
    return state.loading;
  }

  @Selector()
  static error(state: GeoObjectsStateModel) {
    return state.error;
  }

  private service = inject(AdminGeoObjectsService);

  @Action(LoadGeoObjects)
  load(ctx: StateContext<GeoObjectsStateModel>) {
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

  @Action(CreateGeoObject)
  create(
    ctx: StateContext<GeoObjectsStateModel>,
    { geoObject }: CreateGeoObject,
  ) {
    const state = ctx.getState();
    ctx.patchState({ loading: true, error: null });

    return this.service.create(geoObject).pipe(
      tap((createdItem) => {
        const briefItem: GeoObjectBrief = {
          id: createdItem.id,
          name: createdItem.name,
          shortDescription: createdItem.shortDescription,
          typeTitle: createdItem.type?.title ?? null,
          latitude: createdItem.latitude,
          longitude: createdItem.longitude,
          thumbnail: createdItem.thumbnail,
        };
        ctx.patchState({
          items: [...state.items, briefItem],
          loading: false,
        });
      }),
      catchError((err) => {
        ctx.patchState({ loading: false, error: err.message });
        throw err;
      }),
    );
  }

  @Action(UpdateGeoObject)
  update(
    ctx: StateContext<GeoObjectsStateModel>,
    { geoObject }: UpdateGeoObject,
  ) {
    const state = ctx.getState();
    ctx.patchState({ loading: true, error: null });

    return this.service.update(geoObject).pipe(
      tap((updatedItem) => {
        const briefItem: GeoObjectBrief = {
          id: updatedItem.id,
          name: updatedItem.name,
          shortDescription: updatedItem.shortDescription,
          typeTitle: updatedItem.type?.title ?? null,
          latitude: updatedItem.latitude,
          longitude: updatedItem.longitude,
          thumbnail: updatedItem.thumbnail,
        };
        ctx.patchState({
          items: state.items.map((i) => (i.id === updatedItem.id ? briefItem : i)),
          selectedItem: updatedItem,
          loading: false,
        });
      }),
      catchError((err) => {
        ctx.patchState({ loading: false, error: err.message });
        throw err;
      }),
    );
  }

  @Action(DeleteGeoObject)
  delete(ctx: StateContext<GeoObjectsStateModel>, { id }: DeleteGeoObject) {
    const state = ctx.getState();
    ctx.patchState({ loading: true, error: null });

    return this.service.delete(id).pipe(
      tap(() => {
        ctx.patchState({
          items: state.items.filter((i) => i.id !== id),
          selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
          loading: false,
        });
      }),
      catchError((err) => {
        ctx.patchState({ loading: false, error: err.message });
        throw err;
      }),
    );
  }
}
