import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideStore } from "@ngxs/store";

import { routes } from "./app.routes";
import { authInterceptor } from "./interceptors/auth.interceptor";
import { AuthState } from "./store/auth/auth.state";
import { UsersState } from "./store/users/users.state";
import { GeoObjectsState } from "./store/geo-objects/geo-objects.state";
import { GeoObjectTypesState } from "./store/geo-object-types/geo-object-types.state";
import { GeoObjectCategoriesState } from "./store/geo-object-categories/geo-object-categories.state";
import { HistoricalEventsState } from "./store/historical-events/historical-events.state";
import { withNgxsReduxDevtoolsPlugin } from "@ngxs/devtools-plugin";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideStore(
      [
        AuthState,
        UsersState,
        GeoObjectsState,
        GeoObjectTypesState,
        GeoObjectCategoriesState,
        HistoricalEventsState,
      ],
      withNgxsReduxDevtoolsPlugin(),
    ),
  ],
};
