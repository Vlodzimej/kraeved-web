import { Routes } from "@angular/router";
import { authGuard } from "./guards/auth.guard";
import { adminGuard } from "./guards/admin.guard";
import { redirectGuard } from "./guards/redirect.guard";
import { EmptyComponent } from "./components/empty/empty.component";
import { AdminLayoutComponent } from "./components/admin/layout/admin-layout.component";

export const routes: Routes = [
  {
    path: "login",
    loadComponent: () =>
      import("./components/login/login.component").then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: "home",
    loadComponent: () =>
      import("./components/home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "profile",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./components/profile/profile.component").then(
        (m) => m.ProfileComponent,
      ),
  },
  {
    path: "admin",
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: "", redirectTo: "users", pathMatch: "full" },
      {
        path: "users",
        loadComponent: () =>
          import("./components/admin/users/admin-users.component").then(
            (m) => m.AdminUsersComponent,
          ),
      },
      {
        path: "geo-objects",
        loadComponent: () =>
          import("./components/admin/geo-objects/admin-geo-objects.component").then(
            (m) => m.AdminGeoObjectsComponent,
          ),
      },
      {
        path: "geo-object-types",
        loadComponent: () =>
          import("./components/admin/geo-object-types/admin-geo-object-types.component").then(
            (m) => m.AdminGeoObjectTypesComponent,
          ),
      },
      {
        path: "geo-object-categories",
        loadComponent: () =>
          import("./components/admin/geo-object-categories/admin-geo-object-categories.component").then(
            (m) => m.AdminGeoObjectCategoriesComponent,
          ),
      },
      {
        path: "historical-events",
        loadComponent: () =>
          import("./components/admin/historical-events/admin-historical-events.component").then(
            (m) => m.AdminHistoricalEventsComponent,
          ),
      },
      {
        path: "persons",
        loadComponent: () =>
          import("./components/admin/persons/admin-persons.component").then(
            (m) => m.AdminPersonsComponent,
          ),
      },
      {
        path: "settings",
        loadComponent: () =>
          import("./components/admin/settings/admin-settings.component").then(
            (m) => m.AdminSettingsComponent,
          ),
      },
    ],
  },
  { path: "", canActivate: [redirectGuard], component: EmptyComponent },
  { path: "**", redirectTo: "home" },
];
