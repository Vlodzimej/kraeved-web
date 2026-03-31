import { Component, inject, OnInit, signal, computed } from "@angular/core";
import { DatePipe } from "@angular/common";
import { Store } from "@ngxs/store";
import { UsersState } from "../../../store/users/users.state";
import {
  LoadUsers,
  DeleteUser,
  UpdateUserRole,
} from "../../../store/users/users.actions";
import { UserOutDto } from "../../../models/admin/user.model";
import { FormsModule } from "@angular/forms";
import { ConfirmDialogComponent } from "../../shared/confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-admin-users",
  standalone: true,
  imports: [FormsModule, DatePipe, ConfirmDialogComponent],
  templateUrl: "./admin-users.component.html",
  styleUrl: "./admin-users.component.scss",
})
export class AdminUsersComponent implements OnInit {
  private store = inject(Store);

  users = this.store.selectSignal(UsersState.users);
  loading = this.store.selectSignal(UsersState.loading);
  error = this.store.selectSignal(UsersState.error);

  selectedUser = signal<UserOutDto | null>(null);
  editedRole = signal("");
  availableRoles = ["USER", "ADMIN"];

  showDeleteConfirm = signal(false);
  deleteUserId = signal<number | null>(null);

  showCloseConfirm = signal(false);

  hasChanges = computed(() => {
    const user = this.selectedUser();
    return user ? user.role !== this.editedRole() : false;
  });

  ngOnInit(): void {
    this.store.dispatch(new LoadUsers());
  }

  selectUser(user: UserOutDto): void {
    this.selectedUser.set(user);
    this.editedRole.set(user.role);
  }

  closeCard(): void {
    if (this.hasChanges()) {
      this.showCloseConfirm.set(true);
    } else {
      this.selectedUser.set(null);
    }
  }

  confirmClose(): void {
    this.showCloseConfirm.set(false);
    this.selectedUser.set(null);
  }

  cancelClose(): void {
    this.showCloseConfirm.set(false);
  }

  onSave(): void {
    const user = this.selectedUser();
    if (!user) return;

    if (user.role !== this.editedRole()) {
      this.store.dispatch(new UpdateUserRole(user.id, this.editedRole()));
    }
    this.selectedUser.set(null);
  }

  onDelete(id: number): void {
    this.deleteUserId.set(id);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    const id = this.deleteUserId();
    if (id !== null) {
      this.store.dispatch(new DeleteUser(id));
    }
    this.showDeleteConfirm.set(false);
    this.deleteUserId.set(null);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.deleteUserId.set(null);
  }
}
