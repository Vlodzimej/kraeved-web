export class LoadUsers {
  static readonly type = "[Users] Load All";
}

export class DeleteUser {
  static readonly type = "[Users] Delete";
  constructor(public id: number) {}
}

export class UpdateUserRole {
  static readonly type = "[Users] Update Role";
  constructor(
    public id: number,
    public roleName: string,
  ) {}
}
