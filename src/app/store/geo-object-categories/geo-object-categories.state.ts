import { Injectable, inject } from "@angular/core";
import { State, Selector, Action, StateContext } from "@ngxs/store";
import { tap, catchError } from "rxjs";
import { AdminGeoObjectCategoriesService } from "../../services/admin/admin-geo-object-categories.service";
import {
  LoadGeoObjectCategories,
  CreateGeoObjectCategory,
  UpdateGeoObjectCategory,
  DeleteGeoObjectCategory,
} from "./geo-object-categories.actions";
import {
  GeoObjectCategoriesStateModel,
  geoObjectCategoriesStateDefaults,
} from "./geo-object-categories.model";
import { GeoObjectCategory } from "../../models/admin/entities.model";

@State<GeoObjectCategoriesStateModel>({
  name: "geoObjectCategories",
  defaults: geoObjectCategoriesStateDefaults,
})
@Injectable()
export class GeoObjectCategoriesState {
  @Selector()
  static items(state: GeoObjectCategoriesStateModel) {
    return state.items;
  }

  @Selector()
  static loading(state: GeoObjectCategoriesStateModel) {
    return state.loading;
  }

  @Selector()
  static error(state: GeoObjectCategoriesStateModel) {
    return state.error;
  }

  private service = inject(AdminGeoObjectCategoriesService);

  @Action(LoadGeoObjectCategories)
  load(ctx: StateContext<GeoObjectCategoriesStateModel>) {
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

  @Action(CreateGeoObjectCategory)
  create(
    ctx: StateContext<GeoObjectCategoriesStateModel>,
    { item }: CreateGeoObjectCategory,
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
        ctx.patchState({ loading: false, error: err.message });
        throw err;
      }),
    );
  }

  @Action(UpdateGeoObjectCategory)
  update(
    ctx: StateContext<GeoObjectCategoriesStateModel>,
    { item }: UpdateGeoObjectCategory,
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
        ctx.patchState({ loading: false, error: err.message });
        throw err;
      }),
    );
  }

  @Action(DeleteGeoObjectCategory)
  delete(
    ctx: StateContext<GeoObjectCategoriesStateModel>,
    { id }: DeleteGeoObjectCategory,
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
        ctx.patchState({ loading: false, error: err.message });
        throw err;
      }),
    );
  }
}
