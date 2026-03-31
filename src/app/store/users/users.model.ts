import { UserOutDto } from "../../models/admin/user.model";

export interface UsersStateModel {
  users: UserOutDto[];
  loading: boolean;
  error: string | null;
}

export const usersStateDefaults: UsersStateModel = {
  users: [],
  loading: false,
  error: null,
};
