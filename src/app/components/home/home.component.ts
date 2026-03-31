import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { Logout } from "../../store/auth/auth.actions";

@Component({
  selector: "app-home",
  standalone: true,
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export class HomeComponent {
  private store = inject(Store);
  private router = inject(Router);

  onLogout(): void {
    this.store.dispatch(new Logout());
    this.router.navigate(["/login"]);
  }
}
