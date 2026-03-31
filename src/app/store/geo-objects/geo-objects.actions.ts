import { GeoObject } from "../../models/admin/entities.model";

export class LoadGeoObjects {
  static readonly type = "[GeoObjects] Load All";
}

export class CreateGeoObject {
  static readonly type = "[GeoObjects] Create";
  constructor(public geoObject: GeoObject) {}
}

export class UpdateGeoObject {
  static readonly type = "[GeoObjects] Update";
  constructor(public geoObject: GeoObject) {}
}

export class DeleteGeoObject {
  static readonly type = "[GeoObjects] Delete";
  constructor(public id: number) {}
}
