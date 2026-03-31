import { Component, inject, OnInit, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
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
  imports: [DatePipe, FormsModule, ConfirmDialogComponent, AdminCardComponent],
  templateUrl: "./admin-users.component.html",
  styleUrl: "./admin-users.component.scss",
})
export class AdminUsersComponent implements OnInit {
  private store = inject(Store);

  users = this.store.selectSignal(UsersState.users);
  loading = this.store.selectSignal(UsersState.loading);
  error = this.store.selectSignal(UsersState.error);

  editedRole = signal("");
  availableRoles = ["USER", "ADMIN"];

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
    (item) => (item ? item.role !== this.editedRole() : false),
  );

  ngOnInit(): void {
    this.store.dispatch(new LoadUsers());
  }

  selectUser(user: UserOutDto): void {
    this.crud.selectItem(user);
    this.editedRole.set(user.role);
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
  }

  cancelClose(): void {
    this.crud.cancelClose();
  }

  onSave(): void {
    const user = this.crud.selectedItem();
    if (!user) return;

    if (user.role !== this.editedRole()) {
      this.store.dispatch(new UpdateUserRole(user.id, this.editedRole()));
    }
    this.crud.resetCard();
  }
}
