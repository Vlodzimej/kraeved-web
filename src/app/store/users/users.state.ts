import { Injectable, inject } from "@angular/core";
import { State, Selector, Action, StateContext } from "@ngxs/store";
import { tap, catchError } from "rxjs";
import { AdminUsersService } from "../../services/admin/admin-users.service";
import { LoadUsers, DeleteUser, UpdateUserRole } from "./users.actions";
import { UsersStateModel, usersStateDefaults } from "./users.model";

@State<UsersStateModel>({
  name: "users",
  defaults: usersStateDefaults,
})
@Injectable()
export class UsersState {
  @Selector()
  static users(state: UsersStateModel) {
    return state.users;
  }

  @Selector()
  static loading(state: UsersStateModel) {
    return state.loading;
  }

  @Selector()
  static error(state: UsersStateModel) {
    return state.error;
  }

  private usersService = inject(AdminUsersService);

  @Action(LoadUsers)
  loadUsers(ctx: StateContext<UsersStateModel>) {
    ctx.patchState({ loading: true, error: null });
    return this.usersService.getAll().pipe(
      tap((users) => {
        ctx.patchState({ users, loading: false });
      }),
      catchError((err) => {
        ctx.patchState({ loading: false, error: err.message });
        throw err;
      }),
    );
  }

  @Action(DeleteUser)
  deleteUser(ctx: StateContext<UsersStateModel>, { id }: DeleteUser) {
    return this.usersService.delete(id).pipe(
      tap(() => {
        const state = ctx.getState();
        ctx.patchState({
          users: state.users.filter((u) => u.id !== id),
        });
      }),
    );
  }

  @Action(UpdateUserRole)
  updateUserRole(
    ctx: StateContext<UsersStateModel>,
    { id, roleName }: UpdateUserRole,
  ) {
    return this.usersService.updateRole(id, roleName).pipe(
      tap((updatedUser) => {
        const state = ctx.getState();
        ctx.patchState({
          users: state.users.map((u) => (u.id === id ? updatedUser : u)),
        });
      }),
    );
  }
}
