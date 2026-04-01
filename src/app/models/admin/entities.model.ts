export interface GeoObject {
  id?: number | null;
  name: string;
  typeId?: number | null;
  type?: GeoObjectTypeBrief | null;
  description: string;
  shortDescription: string;
  latitude?: number | null;
  longitude?: number | null;
  regionId?: number | null;
  images?: string[] | null;
  thumbnail?: string | null;
}

export interface GeoObjectBrief {
  id?: number | null;
  name: string;
  shortDescription: string;
  typeName?: string | null;
  typeTitle?: string | null;
  typeCategoryName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  thumbnail?: string | null;
}

export interface GeoObjectType {
  id?: number | null;
  name: string;
  title: string;
  categoryId?: number | null;
  category?: GeoObjectCategory | null;
}

export interface GeoObjectTypeBrief {
  id?: number | null;
  name: string;
  title: string;
  categoryName?: string | null;
}

export interface GeoObjectCategory {
  id?: number | null;
  name: string;
  title: string;
}

export interface HistoricalEvent {
  id?: number | null;
  name: string;
  description: string;
  date: string | null;
  regionId?: number | null;
  images?: string[] | null;
  thumbnail?: string | null;
}

export interface HistoricalEventBrief {
  id: number;
  name: string;
  date: string | null;
  regionId: number | null;
}
