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
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideStore([AuthState], withNgxsReduxDevtoolsPlugin()),
  ],
};
