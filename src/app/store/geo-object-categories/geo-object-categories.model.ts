import { GeoObjectCategory } from "../../models/admin/entities.model";

export interface GeoObjectCategoriesStateModel {
  items: GeoObjectCategory[];
  loading: boolean;
  error: string | null;
}

export const geoObjectCategoriesStateDefaults: GeoObjectCategoriesStateModel = {
  items: [],
  loading: false,
  error: null,
};
