import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { HistoricalEvent } from "../../models/admin/entities.model";
import { KraevedResponse } from "../../models/kraeved-response";

@Injectable({ providedIn: "root" })
export class AdminHistoricalEventsService {
  private http = inject(HttpClient);
  private apiUrl = "http://localhost:5000/api/HistoricalEvents";

  getAll(): Observable<HistoricalEvent[]> {
    return this.http
      .get<KraevedResponse<HistoricalEvent[]>>(this.apiUrl)
      .pipe(map((res) => res.data));
  }

  getById(id: number): Observable<HistoricalEvent> {
    return this.http
      .get<KraevedResponse<HistoricalEvent>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  create(event: HistoricalEvent): Observable<HistoricalEvent> {
    return this.http
      .post<KraevedResponse<HistoricalEvent>>(this.apiUrl, event)
      .pipe(map((res) => res.data));
  }

  update(event: HistoricalEvent): Observable<HistoricalEvent> {
    return this.http
      .patch<KraevedResponse<HistoricalEvent>>(this.apiUrl, event)
      .pipe(map((res) => res.data));
  }

  delete(id: number): Observable<HistoricalEvent> {
    return this.http
      .delete<KraevedResponse<HistoricalEvent>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.data));
  }
}
