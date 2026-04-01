import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { LoginInDto } from "../models/login-in-dto";
import { LoginOutDto } from "../models/login-out-dto";
import { KraevedResponse } from "../models/kraeved-response";
import { environment } from "../../environments/environment";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly TOKEN_KEY = "auth_token";
  private apiUrl = `${environment.apiUrl}/auth`;
  private http = inject(HttpClient);

  login(credentials: LoginInDto): Observable<LoginOutDto> {
    return this.http
      .post<KraevedResponse<LoginOutDto>>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map((response) => {
          if (!response.data?.token) {
            throw new Error("Токен не получен");
          }
          return response.data;
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
