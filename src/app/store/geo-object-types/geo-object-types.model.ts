import { GeoObjectType } from "../../models/admin/entities.model";

export interface GeoObjectTypesStateModel {
  items: GeoObjectType[];
  loading: boolean;
  error: string | null;
}

export const geoObjectTypesStateDefaults: GeoObjectTypesStateModel = {
  items: [],
  loading: false,
  error: null,
};
