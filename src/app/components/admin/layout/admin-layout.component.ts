import { Component, inject, OnInit } from "@angular/core";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { Store } from "@ngxs/store";
import { AuthState } from "../../../store/auth/auth.state";
import { Logout } from "../../../store/auth/auth.actions";
import { environment } from "../../../../environments/environment";

@Component({
  selector: "app-admin-layout",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: "./admin-layout.component.html",
  styleUrl: "./admin-layout.component.scss",
})
export class AdminLayoutComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);

  currentUser = this.store.selectSignal(AuthState.currentUser);
  version = environment.version;

  navLinks = [
    { label: "Пользователи", path: "/admin/users" },
    { label: "Объекты", path: "/admin/geo-objects" },
    { label: "Типы объектов", path: "/admin/geo-object-types" },
    { label: "Категории объектов", path: "/admin/geo-object-categories" },
    { label: "События", path: "/admin/historical-events" },
    { label: "Персоналии", path: "/admin/persons" },
    { label: "Настройки", path: "/admin/settings" },
  ];

  ngOnInit(): void {
    if (!this.store.selectSnapshot(AuthState.isAdmin)) {
      this.router.navigate(["/home"]);
    }
  }

  onLogout(): void {
    this.store.dispatch(new Logout());
    this.router.navigate(["/login"]);
  }
}
