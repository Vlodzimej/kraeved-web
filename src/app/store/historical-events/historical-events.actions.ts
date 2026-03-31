import { HistoricalEvent } from "../../models/admin/entities.model";

export class LoadHistoricalEvents {
  static readonly type = "[HistoricalEvents] Load All";
}

export class CreateHistoricalEvent {
  static readonly type = "[HistoricalEvents] Create";
  constructor(public item: HistoricalEvent) {}
}

export class UpdateHistoricalEvent {
  static readonly type = "[HistoricalEvents] Update";
  constructor(public item: HistoricalEvent) {}
}

export class DeleteHistoricalEvent {
  static readonly type = "[HistoricalEvents] Delete";
  constructor(public id: number) {}
}
