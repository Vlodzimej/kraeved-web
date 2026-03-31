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
    return this.service.create(item).pipe(
      tap(() => {
        ctx.dispatch(new LoadGeoObjectCategories());
      }),
    );
  }

  @Action(UpdateGeoObjectCategory)
  update(
    ctx: StateContext<GeoObjectCategoriesStateModel>,
    { item }: UpdateGeoObjectCategory,
  ) {
    return this.service.update(item).pipe(
      tap(() => {
        ctx.dispatch(new LoadGeoObjectCategories());
      }),
    );
  }

  @Action(DeleteGeoObjectCategory)
  delete(
    ctx: StateContext<GeoObjectCategoriesStateModel>,
    { id }: DeleteGeoObjectCategory,
  ) {
    return this.service.delete(id).pipe(
      tap(() => {
        ctx.dispatch(new LoadGeoObjectCategories());
      }),
    );
  }
}
