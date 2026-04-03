import { Injectable, inject } from "@angular/core";
import { State, Selector, Action, StateContext } from "@ngxs/store";
import { tap, catchError, switchMap } from "rxjs";
import { AppSettingsService, AppSetting } from "../../services/admin/admin-settings.service";

export interface AppSettingsStateModel {
  items: AppSetting[];
  loading: boolean;
}

export const appSettingsStateDefaults: AppSettingsStateModel = {
  items: [],
  loading: false,
};

export class LoadAppSettings {
  static readonly type = "[AppSettings] Load";
}

export class UpsertAppSetting {
  static readonly type = "[AppSettings] Upsert";
  constructor(public key: string, public value: string, public description?: string) {}
}

@State<AppSettingsStateModel>({
  name: "appSettings",
  defaults: appSettingsStateDefaults,
})
@Injectable()
export class AppSettingsState {
  @Selector()
  static items(state: AppSettingsStateModel): AppSetting[] {
    return state.items;
  }

  @Selector()
  static loading(state: AppSettingsStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static copyright(state: AppSettingsStateModel): string {
    return state.items.find((s) => s.key === "copyright")?.value ?? "© 2024 Краевед";
  }

  private service = inject(AppSettingsService);

  @Action(LoadAppSettings)
  loadSettings(ctx: StateContext<AppSettingsStateModel>) {
    ctx.patchState({ loading: true });
    return this.service.getAll().pipe(
      tap((items) => {
        ctx.patchState({ items, loading: false });
      }),
      catchError(() => {
        ctx.patchState({ loading: false });
        throw new Error("Failed to load settings");
      }),
    );
  }

  @Action(UpsertAppSetting)
  upsertSetting(ctx: StateContext<AppSettingsStateModel>, { key, value, description }: UpsertAppSetting) {
    return this.service.upsert(key, value, description).pipe(
      switchMap(() => ctx.dispatch(new LoadAppSettings())),
      catchError((err) => {
        throw err;
      }),
    );
  }
}
