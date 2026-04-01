import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
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
import { PaginationComponent } from "../../shared/pagination/pagination.component";
import { SortableHeaderComponent, SortDirection } from "../../shared/sortable-header/sortable-header.component";
import { useAdminCrud } from "../shared/use-admin-crud";

@Component({
  selector: "app-admin-users",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialogComponent,
    AdminCardComponent,
    PaginationComponent,
    SortableHeaderComponent,
  ],
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

  searchQuery = signal("");
  currentPage = signal(1);
  pageSize = signal(10);
  sortColumn = signal<string>("id");
  sortDirection = signal<SortDirection>("asc");

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

  filteredItems = computed(() => {
    const items = this.users();
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return items;
    return items.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.surname.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.phone.toLowerCase().includes(query) ||
        u.role.toLowerCase().includes(query),
    );
  });

  sortedItems = computed(() => {
    const items = [...this.filteredItems()];
    const column = this.sortColumn();
    const dir = this.sortDirection();
    if (!dir) return items;

    items.sort((a, b) => {
      const valA = (a as unknown as Record<string, unknown>)[column];
      const valB = (b as unknown as Record<string, unknown>)[column];
      if (valA == null && valB == null) return 0;
      if (valA == null) return dir === "asc" ? -1 : 1;
      if (valB == null) return dir === "asc" ? 1 : -1;
      if (typeof valA === "number" && typeof valB === "number") {
        return dir === "asc" ? valA - valB : valB - valA;
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return dir === "asc"
        ? strA.localeCompare(strB, "ru")
        : strB.localeCompare(strA, "ru");
    });

    return items;
  });

  pagedItems = computed(() => {
    const items = this.sortedItems();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return items.slice(start, start + size);
  });

  totalFilteredItems = computed(() => this.filteredItems().length);

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

  onSort({ column, direction }: { column: string; direction: SortDirection }): void {
    this.sortColumn.set(column);
    this.sortDirection.set(direction);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }
}
