import { Component, inject, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { Store } from "@ngxs/store";
import { finalize, switchMap } from "rxjs";
import { Login, LoadCurrentUser } from "../../store/auth/auth.actions";
import { AuthService } from "../../services/auth.service";
import { getBackendErrorMessage } from "../../utils/error-messages";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [FormsModule, RouterLink],
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
  protected successMessage = signal("");
  protected isLoading = signal(false);

  protected isRegisterMode = signal(false);
  protected regPassword = signal("");
  protected regPasswordConfirm = signal("");

  toggleMode(): void {
    this.isRegisterMode.set(!this.isRegisterMode());
    this.errorMessage.set("");
    this.successMessage.set("");
    this.email.set("");
    this.password.set("");
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
          this.successMessage.set("");
          this.router.navigate(["/home"]);
        },
        error: (err: Error) => {
          this.successMessage.set("");
          if (err.message) {
            this.errorMessage.set(err.message);
          } else {
            this.errorMessage.set("Ошибка при входе");
          }
        },
      });
  }

  private onRegister(): void {
    if (!this.email() || !this.password() || !this.regPasswordConfirm()) {
      this.errorMessage.set("Заполните все поля");
      return;
    }

    if (this.password() !== this.regPasswordConfirm()) {
      this.errorMessage.set("Пароли не совпадают");
      return;
    }

    if (this.password().length < 6) {
      this.errorMessage.set("Пароль должен быть не менее 6 символов");
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set("");

    this.authService.register(this.email(), this.password()).subscribe({
      next: () => {
        this.isRegisterMode.set(false);
        this.successMessage.set("Регистрация успешна. Войдите в систему.");
        this.email.set("");
        this.password.set("");
        this.regPasswordConfirm.set("");
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.successMessage.set("");
        if (err.message) {
          this.errorMessage.set(getBackendErrorMessage(err.message));
        } else {
          this.errorMessage.set("Ошибка при регистрации");
        }
      },
    });
  }
}
