import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { UserOutDto } from "../../models/admin/user.model";
import { KraevedResponse } from "../../models/kraeved-response";

@Injectable({ providedIn: "root" })
export class AdminUsersService {
  private http = inject(HttpClient);
  private apiUrl = "http://localhost:5000/api/users";

  getAll(): Observable<UserOutDto[]> {
    return this.http
      .get<KraevedResponse<UserOutDto[]>>(`${this.apiUrl}/all`)
      .pipe(map((res) => res.data));
  }

  getById(id: number): Observable<UserOutDto> {
    return this.http
      .get<KraevedResponse<UserOutDto>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateRole(id: number, roleName: string): Observable<UserOutDto> {
    return this.http
      .patch<KraevedResponse<UserOutDto>>(`${this.apiUrl}/${id}/role`, {
        roleName,
      })
      .pipe(map((res) => res.data));
  }
}
