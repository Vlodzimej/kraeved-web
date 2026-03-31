import { inject } from "@angular/core";
import { Router, type CanActivateFn } from "@angular/router";
import { Store } from "@ngxs/store";
import { AuthState } from "../store/auth/auth.state";

export const redirectGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  if (store.selectSnapshot(AuthState.isAuthenticated)) {
    return router.createUrlTree(["/home"]);
  }

  return router.createUrlTree(["/login"]);
};
