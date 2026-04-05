import { ImageInfo } from "../../../../models/admin/entities.model";

export interface PersonTreeNode {
  id: number;
  surname?: string | null;
  firstName?: string | null;
  patronymic?: string | null;
  birthDate?: string | null;
  deathDate?: string | null;
  photos?: ImageInfo[] | null;
  parents?: PersonTreeNode[] | null;
  spouses?: PersonRelationDto[] | null;
  children?: PersonRelationDto[] | null;
  siblings?: PersonRelationDto[] | null;
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
