import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { tap, map } from "rxjs/operators";
import { LoginInDto } from "../models/login-in-dto";
import { LoginOutDto } from "../models/login-out-dto";
import { KraevedResponse } from "../models/kraeved-response";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly TOKEN_KEY = "auth_token";
  private apiUrl = "http://localhost:5000/api/auth";

  private authenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  authenticated$ = this.authenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

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
        tap((data) => {
          this.saveToken(data.token!);
          this.authenticatedSubject.next(true);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.authenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }
}
