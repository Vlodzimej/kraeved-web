import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { Person } from "../../models/admin/entities.model";
import { KraevedResponse } from "../../models/kraeved-response";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: "root" })
export class AdminPersonsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Persons`;

  getAll(): Observable<Person[]> {
    return this.http
      .get<KraevedResponse<Person[]>>(this.apiUrl)
      .pipe(map((res) => res.data));
  }

  getById(id: number): Observable<Person> {
    return this.http
      .get<KraevedResponse<Person>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  create(person: Person): Observable<Person> {
    return this.http
      .post<KraevedResponse<Person>>(this.apiUrl, person)
      .pipe(map((res) => res.data));
  }

  update(person: Person): Observable<Person> {
    return this.http
      .put<KraevedResponse<Person>>(this.apiUrl, person)
      .pipe(map((res) => res.data));
  }

  delete(id: number): Observable<Person> {
    return this.http
      .delete<KraevedResponse<Person>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.data));
  }
}
