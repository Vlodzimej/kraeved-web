import { Component, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { Store } from "@ngxs/store";
import { finalize, switchMap } from "rxjs";
import { Login, LoadCurrentUser } from "../../store/auth/auth.actions";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent {
  private store = inject(Store);
  private router = inject(Router);

  protected email = signal("");
  protected password = signal("");
  protected errorMessage = signal("");
  protected isLoading = signal(false);

  onSubmit(): void {
    if (!this.email() || !this.password()) {
      this.errorMessage.set("Заполните все поля");
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set("");

    this.store
      .dispatch(new Login(this.email(), this.password()))
      .pipe(
        switchMap(() => this.store.dispatch(new LoadCurrentUser())),
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: () => {
          const isAdmin = this.store.selectSnapshot(
            (state: any) => state.auth.isAdmin,
          );
          this.router.navigate([isAdmin ? "/admin" : "/home"]);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 401) {
            this.errorMessage.set("Введены неверные данные для входа");
          } else if (err.status === 0) {
            this.errorMessage.set("Не удалось подключиться к серверу");
          } else if (err.error?.data) {
            const errorData = err.error.data;
            if (typeof errorData === "object" && errorData.message) {
              this.errorMessage.set(errorData.message);
            } else if (typeof errorData === "string") {
              this.errorMessage.set(errorData);
            } else {
              this.errorMessage.set("Ошибка при входе");
            }
          } else if (err.error?.message) {
            this.errorMessage.set(err.error.message);
          } else {
            this.errorMessage.set("Ошибка при входе");
          }
        },
      });
  }
}
