import { GeoObjectCategory } from "../../models/admin/entities.model";

export class LoadGeoObjectCategories {
  static readonly type = "[GeoObjectCategories] Load All";
}

export class CreateGeoObjectCategory {
  static readonly type = "[GeoObjectCategories] Create";
  constructor(public item: GeoObjectCategory) {}
}

export class UpdateGeoObjectCategory {
  static readonly type = "[GeoObjectCategories] Update";
  constructor(public item: GeoObjectCategory) {}
}

export class DeleteGeoObjectCategory {
  static readonly type = "[GeoObjectCategories] Delete";
  constructor(public id: number) {}
}
