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
    return this.service.create(geoObject).pipe(
      tap(() => {
        ctx.dispatch(new LoadGeoObjects());
      }),
    );
  }

  @Action(UpdateGeoObject)
  update(
    ctx: StateContext<GeoObjectsStateModel>,
    { geoObject }: UpdateGeoObject,
  ) {
    return this.service.update(geoObject).pipe(
      tap(() => {
        ctx.dispatch(new LoadGeoObjects());
      }),
    );
  }

  @Action(DeleteGeoObject)
  delete(ctx: StateContext<GeoObjectsStateModel>, { id }: DeleteGeoObject) {
    return this.service.delete(id).pipe(
      tap(() => {
        ctx.dispatch(new LoadGeoObjects());
      }),
    );
  }
}
