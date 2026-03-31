import { HistoricalEvent } from "../../models/admin/entities.model";

export interface HistoricalEventsStateModel {
  items: HistoricalEvent[];
  loading: boolean;
  error: string | null;
}

export const historicalEventsStateDefaults: HistoricalEventsStateModel = {
  items: [],
  loading: false,
  error: null,
};
