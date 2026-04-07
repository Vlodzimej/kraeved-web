import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { GeoObject, GeoObjectBrief, GeoObjectCustomFields } from "../../models/admin/entities.model";
import { KraevedResponse } from "../../models/kraeved-response";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: "root" })
export class AdminGeoObjectsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/GeoObjects`;

  getAll(): Observable<GeoObjectBrief[]> {
    return this.http
      .get<KraevedResponse<GeoObjectBrief[]>>(this.apiUrl)
      .pipe(map((res) => res.data));
  }

  getById(id: number): Observable<GeoObject> {
    return this.http
      .get<KraevedResponse<GeoObject>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => {
        const data = res.data;
        if (data.customFields && typeof data.customFields === "string") {
          try {
            data.customFields = JSON.parse(data.customFields) as GeoObjectCustomFields;
          } catch {
            data.customFields = null;
          }
        }
        return data;
      }));
  }

  create(geoObject: GeoObject): Observable<GeoObject> {
    const payload = { ...geoObject };
    if (payload.customFields && typeof payload.customFields === "object") {
      payload.customFields = JSON.stringify(payload.customFields) as unknown as GeoObjectCustomFields;
    }
    return this.http
      .post<KraevedResponse<GeoObject>>(this.apiUrl, payload)
      .pipe(map((res) => {
        const data = res.data;
        if (data.customFields && typeof data.customFields === "string") {
          try {
            data.customFields = JSON.parse(data.customFields) as GeoObjectCustomFields;
          } catch {
            data.customFields = null;
          }
        }
        return data;
      }));
  }

  update(geoObject: GeoObject): Observable<GeoObject> {
    const payload = { ...geoObject };
    if (payload.customFields && typeof payload.customFields === "object") {
      payload.customFields = JSON.stringify(payload.customFields) as unknown as GeoObjectCustomFields;
    }
    return this.http
      .put<KraevedResponse<GeoObject>>(this.apiUrl, payload)
      .pipe(map((res) => {
        const data = res.data;
        if (data.customFields && typeof data.customFields === "string") {
          try {
            data.customFields = JSON.parse(data.customFields) as GeoObjectCustomFields;
          } catch {
            data.customFields = null;
          }
        }
        return data;
      }));
  }

  delete(id: number): Observable<GeoObject> {
    return this.http
      .delete<KraevedResponse<GeoObject>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  importFromJson(file: File): Observable<{ imported: number; failed: number; errors: string[] | null }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<KraevedResponse<{ imported: number; failed: number; errors: string[] | null }>>(`${this.apiUrl}/import`, formData)
      .pipe(map((res) => res.data));
  }
}
