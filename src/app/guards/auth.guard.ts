import { inject } from "@angular/core";
import { Router, type CanActivateFn } from "@angular/router";
import { Store } from "@ngxs/store";
import { AuthState } from "../store/auth/auth.state";

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  if (store.selectSnapshot(AuthState.isAuthenticated)) {
    return true;
  }

  router.navigate(["/login"]);
  return false;
};
