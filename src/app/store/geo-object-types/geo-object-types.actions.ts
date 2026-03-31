import { GeoObjectType } from "../../models/admin/entities.model";

export class LoadGeoObjectTypes {
  static readonly type = "[GeoObjectTypes] Load All";
}

export class CreateGeoObjectType {
  static readonly type = "[GeoObjectTypes] Create";
  constructor(public item: GeoObjectType) {}
}

export class UpdateGeoObjectType {
  static readonly type = "[GeoObjectTypes] Update";
  constructor(public item: GeoObjectType) {}
}

export class DeleteGeoObjectType {
  static readonly type = "[GeoObjectTypes] Delete";
  constructor(public id: number) {}
}
