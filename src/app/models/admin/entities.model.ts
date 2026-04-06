export interface ImageInfo {
  id?: number | null;
  filename: string;
  caption?: string | null;
}

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
  parentId?: number | null;
  parent?: GeoObjectBrief | null;
  children?: GeoObjectBrief[] | null;
  images?: ImageInfo[] | null;
  thumbnail?: string | null;
  customFields?: GeoObjectCustomFields | string | null;
  personGeoObjects?: PersonGeoObjectBrief[] | null;
}

export interface GeoObjectCustomFields {
  okn_full_name?: string | null;
  regulatory_legal_info?: string | null;
  location_description?: string | null;
  cadastral_address?: string | null;
  egrokn_status?: string | null;
  object_type?: string | null;
  date?: string | null;
  status?: string | null;
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
  categoryId?: number | null;
  categoryName?: string | null;
  categoryTitle?: string | null;
  category?: GeoObjectCategory | null;
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
  photos?: ImageInfo[] | null;
  personGeoObjects?: PersonGeoObjectBrief[] | null;
}

export interface PersonBrief {
  id?: number | null;
  surname: string;
  firstName: string;
  patronymic?: string | null;
  birthDate?: string | null;
  deathDate?: string | null;
  photos?: ImageInfo[] | null;
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
  photos?: ImageInfo[] | null;
  relationTitle?: string | null;
}

export interface PersonTreeNode {
  id: number;
  surname?: string | null;
  firstName?: string | null;
  patronymic?: string | null;
  birthDate?: string | null;
  deathDate?: string | null;
  photos?: ImageInfo[] | null;
  father?: PersonTreeNode | null;
  mother?: PersonTreeNode | null;
  spouses?: PersonRelationDto[] | null;
  children?: PersonRelationDto[] | null;
  siblings?: PersonRelationDto[] | null;
}
