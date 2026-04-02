export interface PersonsStateModel {
  items: any[];
  loading: boolean;
  error: string | null;
}

export const personsStateDefaults: PersonsStateModel = {
  items: [],
  loading: false,
  error: null,
};
