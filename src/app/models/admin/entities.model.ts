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
  personGeoObjects?: PersonGeoObjectBrief[] | null;
}

export interface GeoObjectBrief {
  id?: number | null;
  name: string;
  shortDescription: string;
  typeId?: number | null;
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

export interface Person {
  id?: number | null;
  surname: string;
  firstName: string;
  patronymic?: string | null;
  biography?: string | null;
  birthDate?: string | null;
  deathDate?: string | null;
  photos?: string[] | null;
  personGeoObjects?: PersonGeoObjectBrief[] | null;
}

export interface PersonBrief {
  id?: number | null;
  surname: string;
  firstName: string;
  patronymic?: string | null;
  birthDate?: string | null;
  deathDate?: string | null;
  photos?: string[] | null;
}

export interface PersonGeoObjectBrief {
  geoObjectId?: number | null;
  geoObject?: GeoObjectBrief | null;
  personId?: number | null;
  person?: PersonBrief | null;
}

export interface PersonRelationType {
  id: number;
  title: string;
  name: string;
  pairedTypeId?: number | null;
}

export interface PersonRelationDto {
  personId: number;
  surname?: string | null;
  firstName?: string | null;
  patronymic?: string | null;
  birthDate?: string | null;
  deathDate?: string | null;
  photos?: string[] | null;
  relationTitle?: string | null;
}
