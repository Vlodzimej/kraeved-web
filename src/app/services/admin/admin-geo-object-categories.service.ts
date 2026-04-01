import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { GeoObjectCategory } from "../../models/admin/entities.model";
import { KraevedResponse } from "../../models/kraeved-response";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: "root" })
export class AdminGeoObjectCategoriesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/GeoObjectCategories`;

  getAll(): Observable<GeoObjectCategory[]> {
    return this.http
      .get<KraevedResponse<GeoObjectCategory[]>>(this.apiUrl)
      .pipe(map((res) => res.data));
  }

  getById(id: number): Observable<GeoObjectCategory> {
    return this.http
      .get<KraevedResponse<GeoObjectCategory>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  create(category: GeoObjectCategory): Observable<GeoObjectCategory> {
    return this.http
      .post<KraevedResponse<GeoObjectCategory>>(this.apiUrl, category)
      .pipe(map((res) => res.data));
  }

  update(category: GeoObjectCategory): Observable<GeoObjectCategory> {
    return this.http
      .put<KraevedResponse<GeoObjectCategory>>(this.apiUrl, category)
      .pipe(map((res) => res.data));
  }

  delete(id: number): Observable<GeoObjectCategory> {
    return this.http
      .delete<KraevedResponse<GeoObjectCategory>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.data));
  }
}
