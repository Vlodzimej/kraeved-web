import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { KraevedResponse } from "../models/kraeved-response";
import { environment } from "../../environments/environment";

export interface CommentDto {
  id: number;
  geoObjectId: number;
  userId: number;
  text: string;
  createdAt: string;
  user?: {
    id: number;
    email: string;
    name: string;
    surname: string;
    avatar?: string | null;
  };
}

@Injectable({ providedIn: "root" })
export class CommentsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Comments`;

  getByGeoObjectId(geoObjectId: number): Observable<CommentDto[]> {
    return this.http
      .get<KraevedResponse<CommentDto[]>>(`${this.apiUrl}/geo-object/${geoObjectId}`)
      .pipe(map((res) => res.data));
  }

  getLatestByGeoObjectId(geoObjectId: number): Observable<CommentDto | null> {
    return this.http
      .get<KraevedResponse<CommentDto | null>>(`${this.apiUrl}/geo-object/${geoObjectId}/latest`)
      .pipe(map((res) => res.data));
  }

  add(geoObjectId: number, text: string): Observable<CommentDto> {
    return this.http
      .post<KraevedResponse<CommentDto>>(this.apiUrl, { geoObjectId, text })
      .pipe(map((res) => res.data));
  }

  delete(id: number): Observable<CommentDto> {
    return this.http
      .delete<KraevedResponse<CommentDto>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.data));
  }
}
