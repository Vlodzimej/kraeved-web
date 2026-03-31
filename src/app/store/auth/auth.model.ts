import { UserOutDto } from "../../models/admin/user.model";

export interface AuthStateModel {
  token: string | null;
  isAuthenticated: boolean;
  currentUser: UserOutDto | null;
  isAdmin: boolean;
}

export const authStateDefaults: AuthStateModel = {
  token: localStorage.getItem("auth_token"),
  isAuthenticated: !!localStorage.getItem("auth_token"),
  currentUser: null,
  isAdmin: false,
};
