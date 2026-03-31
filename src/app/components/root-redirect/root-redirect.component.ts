import { Component, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { AuthState } from "../../store/auth/auth.state";

@Component({
  selector: "app-root-redirect",
  standalone: true,
  template: "",
})
export class RootRedirectComponent implements OnInit {
  private router = inject(Router);
  private store = inject(Store);

  ngOnInit(): void {
    if (this.store.selectSnapshot(AuthState.isAuthenticated)) {
      this.router.navigate(["/home"]);
    } else {
      this.router.navigate(["/login"]);
    }
  }
}
