import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { KraevedResponse } from "../../models/kraeved-response";
import { environment } from "../../../environments/environment";

export interface AppSetting {
  id: number;
  key: string;
  value: string;
  description?: string | null;
}

@Injectable({ providedIn: "root" })
export class AppSettingsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/AppSettings`;

  getAll(): Observable<AppSetting[]> {
    return this.http
      .get<KraevedResponse<AppSetting[]>>(this.apiUrl)
      .pipe(map((res) => res.data));
  }

  getByKey(key: string): Observable<AppSetting> {
    return this.http
      .get<KraevedResponse<AppSetting>>(`${this.apiUrl}/${key}`)
      .pipe(map((res) => res.data));
  }

  upsert(key: string, value: string, description?: string): Observable<AppSetting> {
    return this.http
      .post<KraevedResponse<AppSetting>>(this.apiUrl, { key, value, description })
      .pipe(map((res) => res.data));
  }
}
