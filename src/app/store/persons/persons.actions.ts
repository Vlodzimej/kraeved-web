import { Person } from "../../models/admin/entities.model";

export class LoadPersons {
  static readonly type = "[Persons] Load";
}

export class CreatePerson {
  static readonly type = "[Persons] Create";
  constructor(public person: Person) {}
}

export class UpdatePerson {
  static readonly type = "[Persons] Update";
  constructor(public person: Person) {}
}

export class DeletePerson {
  static readonly type = "[Persons] Delete";
  constructor(public id: number) {}
}
