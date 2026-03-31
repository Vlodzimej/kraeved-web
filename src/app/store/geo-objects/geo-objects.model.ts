import { GeoObject, GeoObjectBrief } from "../../models/admin/entities.model";

export interface GeoObjectsStateModel {
  items: GeoObjectBrief[];
  selectedItem: GeoObject | null;
  loading: boolean;
  error: string | null;
}

export const geoObjectsStateDefaults: GeoObjectsStateModel = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
};
