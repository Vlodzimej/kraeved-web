import { Component, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { Store } from "@ngxs/store";
import { finalize, switchMap } from "rxjs";
import { Login, LoadCurrentUser } from "../../store/auth/auth.actions";
import { AuthService } from "../../services/auth.service";

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
  private authService = inject(AuthService);

  protected email = signal("");
  protected password = signal("");
  protected errorMessage = signal("");
  protected isLoading = signal(false);

  protected isRegisterMode = signal(false);
  protected regPassword = signal("");
  protected regPasswordConfirm = signal("");

  toggleMode(): void {
    this.isRegisterMode.set(!this.isRegisterMode());
    this.errorMessage.set("");
    this.email.set("");
    this.password.set("");
    this.regPassword.set("");
    this.regPasswordConfirm.set("");
  }

  onSubmit(): void {
    if (this.isRegisterMode()) {
      this.onRegister();
    } else {
      this.onLogin();
    }
  }

  private onLogin(): void {
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
          this.router.navigate(["/home"]);
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

  private onRegister(): void {
    if (!this.email() || !this.regPassword() || !this.regPasswordConfirm()) {
      this.errorMessage.set("Заполните все поля");
      return;
    }

    if (this.regPassword() !== this.regPasswordConfirm()) {
      this.errorMessage.set("Пароли не совпадают");
      return;
    }

    if (this.regPassword().length < 6) {
      this.errorMessage.set("Пароль должен быть не менее 6 символов");
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set("");

    this.authService.register(this.email(), this.regPassword()).subscribe({
      next: () => {
        this.isRegisterMode.set(false);
        this.errorMessage.set("Регистрация успешна. Войдите в систему.");
        this.email.set("");
        this.regPassword.set("");
        this.regPasswordConfirm.set("");
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        if (err.status === 0) {
          this.errorMessage.set("Не удалось подключиться к серверу");
        } else if (err.error?.message) {
          this.errorMessage.set(err.error.message);
        } else if (err.error?.data) {
          const errorData = err.error.data;
          if (typeof errorData === "object" && errorData.message) {
            this.errorMessage.set(errorData.message);
          } else if (typeof errorData === "string") {
            this.errorMessage.set(errorData);
          } else {
            this.errorMessage.set("Ошибка при регистрации");
          }
        } else {
          this.errorMessage.set("Ошибка при регистрации");
        }
      },
    });
  }
}
