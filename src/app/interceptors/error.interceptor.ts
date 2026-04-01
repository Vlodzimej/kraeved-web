import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = "Произошла неизвестная ошибка";

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Ошибка: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = error.error?.data?.message || "Неверный запрос";
            break;
          case 401:
            errorMessage = "Требуется авторизация";
            break;
          case 403:
            errorMessage = "Доступ запрещен";
            break;
          case 404:
            errorMessage = "Ресурс не найден";
            break;
          case 500:
            errorMessage = "Внутренняя ошибка сервера";
            break;
          default:
            errorMessage = error.error?.data?.message || `Ошибка: ${error.message}`;
            break;
        }
      }

      return throwError(() => new Error(errorMessage));
    }),
  );
};
