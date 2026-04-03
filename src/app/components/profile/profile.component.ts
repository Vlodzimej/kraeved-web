import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormBuilder, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { UserOutDto } from "../../models/admin/user.model";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./profile.component.html",
  styleUrl: "./profile.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  user = signal<UserOutDto | null>(null);
  loading = signal(false);
  saving = signal(false);
  successMessage = signal("");
  errorMessage = signal("");
  isEditing = signal(false);

  form = this.fb.group({
    email: [{ value: "", disabled: true }, Validators.required],
    name: [""],
    surname: [""],
  });

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.loading.set(true);
    this.authService.getCurrentUser().subscribe({
      next: (u) => {
        this.user.set(u);
        this.form.patchValue({
          email: u.email,
          name: u.name,
          surname: u.surname,
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(["/login"]);
      },
    });
  }

  startEditing(): void {
    this.isEditing.set(true);
    this.successMessage.set("");
    this.errorMessage.set("");
  }

  cancelEditing(): void {
    this.isEditing.set(false);
    this.successMessage.set("");
    this.errorMessage.set("");
    const u = this.user();
    if (u) {
      this.form.patchValue({ name: u.name, surname: u.surname });
    }
  }

  saveProfile(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.successMessage.set("");
    this.errorMessage.set("");

    const updates: Partial<UserOutDto> = {
      name: this.form.get("name")?.value ?? "",
      surname: this.form.get("surname")?.value ?? "",
    };

    this.authService.updateCurrentUser(updates).subscribe({
      next: (u) => {
        this.user.set(u);
        this.form.patchValue({ name: u.name, surname: u.surname });
        this.isEditing.set(false);
        this.successMessage.set("Профиль успешно обновлён");
        this.saving.set(false);
      },
      error: () => {
        this.errorMessage.set("Ошибка при сохранении");
        this.saving.set(false);
      },
    });
  }
}
