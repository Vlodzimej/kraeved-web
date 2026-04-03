export interface PersonTreeNode {
  id: number;
  surname?: string | null;
  firstName?: string | null;
  patronymic?: string | null;
  birthDate?: string | null;
  deathDate?: string | null;
  photos?: string[] | null;
  father?: PersonTreeNode | null;
  mother?: PersonTreeNode | null;
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
  photos?: string[] | null;
  relationTitle?: string | null;
}
