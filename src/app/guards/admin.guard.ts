import { inject } from "@angular/core";
import { Router, type CanActivateFn } from "@angular/router";
import { Store } from "@ngxs/store";
import { AuthState } from "../store/auth/auth.state";

export const adminGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  if (store.selectSnapshot(AuthState.isAdmin)) {
    return true;
  }

  router.navigate(["/home"]);
  return false;
};
