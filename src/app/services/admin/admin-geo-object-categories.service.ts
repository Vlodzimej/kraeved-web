import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GeoObjectCategory } from "../../models/admin/entities.model";

@Injectable({ providedIn: "root" })
export class AdminGeoObjectCategoriesService {
  private http = inject(HttpClient);
  private apiUrl = "http://localhost:5000/api/GeoObjectCategories";

  getAll(): Observable<GeoObjectCategory[]> {
    return this.http.get<GeoObjectCategory[]>(this.apiUrl);
  }

  getById(id: number): Observable<GeoObjectCategory> {
    return this.http.get<GeoObjectCategory>(`${this.apiUrl}/${id}`);
  }

  create(category: GeoObjectCategory): Observable<GeoObjectCategory> {
    return this.http.post<GeoObjectCategory>(this.apiUrl, category);
  }

  update(category: GeoObjectCategory): Observable<GeoObjectCategory> {
    return this.http.put<GeoObjectCategory>(this.apiUrl, category);
  }

  delete(id: number): Observable<GeoObjectCategory> {
    return this.http.delete<GeoObjectCategory>(`${this.apiUrl}/${id}`);
  }
}
