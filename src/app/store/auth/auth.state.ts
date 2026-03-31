import { Injectable } from "@angular/core";
import { State, Selector, Action, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { Login, Logout, CheckAuth } from "./auth.actions";
import { AuthStateModel, authStateDefaults } from "./auth.model";

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

  constructor(private authService: AuthService) {}

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
}
