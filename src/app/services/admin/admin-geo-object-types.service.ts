import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { GeoObjectType } from "../../models/admin/entities.model";
import { KraevedResponse } from "../../models/kraeved-response";

@Injectable({ providedIn: "root" })
export class AdminGeoObjectTypesService {
  private http = inject(HttpClient);
  private apiUrl = "http://localhost:5000/api/GeoObjectTypes";

  getAll(): Observable<GeoObjectType[]> {
    return this.http
      .get<KraevedResponse<GeoObjectType[]>>(this.apiUrl)
      .pipe(map((res) => res.data));
  }

  getById(id: number): Observable<GeoObjectType> {
    return this.http
      .get<KraevedResponse<GeoObjectType>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  create(type: GeoObjectType): Observable<GeoObjectType> {
    return this.http
      .post<KraevedResponse<GeoObjectType>>(this.apiUrl, type)
      .pipe(map((res) => res.data));
  }

  update(type: GeoObjectType): Observable<GeoObjectType> {
    return this.http
      .put<KraevedResponse<GeoObjectType>>(this.apiUrl, type)
      .pipe(map((res) => res.data));
  }

  delete(id: number): Observable<GeoObjectType> {
    return this.http
      .delete<KraevedResponse<GeoObjectType>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.data));
  }
}
