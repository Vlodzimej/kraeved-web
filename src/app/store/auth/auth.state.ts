import { Injectable, inject } from "@angular/core";
import { State, Selector, Action, StateContext } from "@ngxs/store";
import { HttpClient } from "@angular/common/http";
import { tap, catchError } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { Login, Logout, CheckAuth, LoadCurrentUser } from "./auth.actions";
import { AuthStateModel, authStateDefaults } from "./auth.model";
import { KraevedResponse } from "../../models/kraeved-response";
import { UserOutDto } from "../../models/admin/user.model";
import { environment } from "../../../environments/environment";

@State<AuthStateModel>({
  name: "auth",
  defaults: authStateDefaults,
})
@Injectable()
export class AuthState {
  @Selector()
  static token(state: AuthStateModel): string | null {
    return state.token;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return state.isAuthenticated;
  }

  @Selector()
  static currentUser(state: AuthStateModel): UserOutDto | null {
    return state.currentUser;
  }

  @Selector()
  static isAdmin(state: AuthStateModel): boolean {
    return state.isAdmin;
  }

  private authService = inject(AuthService);
  private http = inject(HttpClient);

  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, { email, password }: Login) {
    return this.authService.login({ email, password }).pipe(
      tap((data) => {
        ctx.patchState({
          token: data.token,
          isAuthenticated: true,
        });
      }),
    );
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    this.authService.logout();
    ctx.patchState({
      token: null,
      isAuthenticated: false,
      currentUser: null,
      isAdmin: false,
    });
  }

  @Action(CheckAuth)
  checkAuth(ctx: StateContext<AuthStateModel>) {
    const token = this.authService.getToken();
    ctx.patchState({
      token,
      isAuthenticated: !!token,
    });
  }

  @Action(LoadCurrentUser)
  loadCurrentUser(ctx: StateContext<AuthStateModel>) {
    const token = ctx.getState().token;
    if (!token) {
      ctx.patchState({
        currentUser: null,
        isAdmin: false,
      });
      return;
    }

    return this.http
      .get<
        KraevedResponse<UserOutDto>
      >(`${environment.apiUrl}/users/current`)
      .pipe(
        tap((response) => {
          const user = response.data;
          ctx.patchState({
            currentUser: user,
            isAdmin: user?.role === "ADMIN",
          });
        }),
        catchError(() => {
          ctx.patchState({
            token: null,
            isAuthenticated: false,
            currentUser: null,
            isAdmin: false,
          });
          return [];
        }),
      );
  }
}
