export interface AuthStateModel {
  token: string | null;
  isAuthenticated: boolean;
}

export const authStateDefaults: AuthStateModel = {
  token: localStorage.getItem("auth_token"),
  isAuthenticated: !!localStorage.getItem("auth_token"),
};
