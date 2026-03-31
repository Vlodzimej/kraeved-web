import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { GeoObject, GeoObjectBrief } from "../../models/admin/entities.model";
import { KraevedResponse } from "../../models/kraeved-response";

@Injectable({ providedIn: "root" })
export class AdminGeoObjectsService {
  private http = inject(HttpClient);
  private apiUrl = "http://localhost:5000/api/GeoObjects";

  getAll(): Observable<GeoObjectBrief[]> {
    return this.http
      .get<KraevedResponse<GeoObjectBrief[]>>(this.apiUrl)
      .pipe(map((res) => res.data));
  }

  getById(id: number): Observable<GeoObject> {
    return this.http
      .get<KraevedResponse<GeoObject>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  create(geoObject: GeoObject): Observable<GeoObject> {
    return this.http
      .post<KraevedResponse<GeoObject>>(this.apiUrl, geoObject)
      .pipe(map((res) => res.data));
  }

  update(geoObject: GeoObject): Observable<GeoObject> {
    return this.http
      .put<KraevedResponse<GeoObject>>(this.apiUrl, geoObject)
      .pipe(map((res) => res.data));
  }

  delete(id: number): Observable<GeoObject> {
    return this.http
      .delete<KraevedResponse<GeoObject>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.data));
  }
}
