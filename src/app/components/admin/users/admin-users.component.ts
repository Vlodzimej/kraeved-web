import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from "@angular/core";
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { DatePipe } from "@angular/common";
import { Store } from "@ngxs/store";
import { UsersState } from "../../../store/users/users.state";
import {
  LoadUsers,
  DeleteUser,
  UpdateUserRole,
} from "../../../store/users/users.actions";
import { UserOutDto } from "../../../models/admin/user.model";
import { ConfirmDialogComponent } from "../../shared/confirm-dialog/confirm-dialog.component";
import { AdminCardComponent } from "../shared/card/admin-card.component";
import { useAdminCrud } from "../shared/use-admin-crud";

@Component({
  selector: "app-admin-users",
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, ConfirmDialogComponent, AdminCardComponent],
  templateUrl: "./admin-users.component.html",
  styleUrl: "./admin-users.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(NonNullableFormBuilder);

  users = this.store.selectSignal(UsersState.users);
  loading = this.store.selectSignal(UsersState.loading);
  error = this.store.selectSignal(UsersState.error);

  availableRoles = ["USER", "ADMIN"];

  form = this.fb.group({
    role: ["", Validators.required],
  });

  crud = useAdminCrud<UserOutDto>(
    () => ({
      id: 0,
      phone: "",
      email: "",
      name: "",
      surname: "",
      startDate: "",
      role: "",
    }),
    (item) => {
      if (!item) return false;
      return item.role !== this.form.getRawValue().role;
    },
  );

  ngOnInit(): void {
    this.store.dispatch(new LoadUsers());
  }

  selectUser(user: UserOutDto): void {
    this.crud.selectItem(user);
    this.form.patchValue({ role: user.role });
  }

  onDelete(id: number): void {
    this.crud.onDelete(id);
  }

  confirmDelete(): void {
    const id = this.crud.deleteItemId();
    if (id !== null) {
      this.store.dispatch(new DeleteUser(id));
    }
    this.crud.confirmDelete();
  }

  cancelDelete(): void {
    this.crud.cancelDelete();
  }

  closeCard(): void {
    this.crud.closeCard();
  }

  confirmClose(): void {
    this.crud.confirmClose();
    this.form.reset({ role: "" });
  }

  cancelClose(): void {
    this.crud.cancelClose();
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.crud.selectedItem();
    if (!user) return;

    const formValue = this.form.getRawValue();
    if (user.role !== formValue.role) {
      this.store.dispatch(new UpdateUserRole(user.id, formValue.role));
    }
    this.crud.resetCard();
  }
}
