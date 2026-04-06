import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { GeoObject, GeoObjectBrief, PersonBrief, GeoObjectCustomFields } from "../models/admin/entities.model";
import { KraevedResponse } from "../models/kraeved-response";
import { environment } from "../../environments/environment";

@Injectable({ providedIn: "root" })
export class GeoObjectsService {
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

  getPersonsByGeoObjectId(geoObjectId: number): Observable<PersonBrief[]> {
    return this.http
      .get<KraevedResponse<PersonBrief[]>>(`${this.apiUrl}/${geoObjectId}/persons`)
      .pipe(map((res) => res.data));
  }
}
