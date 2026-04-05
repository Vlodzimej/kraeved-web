import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { catchError, throwError } from "rxjs";
import { getBackendErrorMessage } from "../utils/error-messages";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = "Произошла неизвестная ошибка";

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Ошибка: ${error.error.message}`;
      } else {
        const serverMessage = error.error?.data?.message ?? error.error?.message;

        switch (error.status) {
          case 400:
            errorMessage = serverMessage ? getBackendErrorMessage(serverMessage) : "Неверный запрос";
            break;
          case 401:
            errorMessage = serverMessage ? getBackendErrorMessage(serverMessage) : "Требуется авторизация";
            break;
          case 403:
            errorMessage = "Доступ запрещен";
            break;
          case 404:
            errorMessage = serverMessage ? getBackendErrorMessage(serverMessage) : "Ресурс не найден";
            break;
          case 500:
            errorMessage = serverMessage ? getBackendErrorMessage(serverMessage) : "Внутренняя ошибка сервера";
            break;
          default:
            errorMessage = serverMessage ? getBackendErrorMessage(serverMessage) : `Ошибка: ${error.message}`;
            break;
        }
      }

      return throwError(() => new Error(errorMessage));
    }),
  );
};
