const backendErrorMessages: Record<string, string> = {
  "Not found": "Объект не найден",
  "Created object not found": "Созданный объект не найден",
  "Unknown error": "Произошла неизвестная ошибка",
  "Object equals null": "Объект не может быть пустым",
  "Object exists": "Объект уже существует",
  "GeoObjectType not found": "Тип объекта не найден",
  "GeoObjectType is null": "Тип объекта не указан",
  "File is empty": "Файл не выбран",
  "Extension is not allowed": "Недопустимый формат файла",
  "Invalid phone number": "Неверный формат номера телефона",
  "Invalid confirmation code": "Неверный код подтверждения",
  "Too many login attempts": "Слишком много попыток входа. Попробуйте позже",
  "Invalid secret key": "Неверный секретный ключ",
  "User not found": "Пользователь не найден",
  "Invalid password": "Неверный пароль",
  "Authorisation error": "Ошибка авторизации",
  "The password cannot be empty or contain spaces": "Пароль не может быть пустым или содержать пробелы",
  "Value cannot be empty or whitespace only string": "Значение не может быть пустым",
  "Sms service error": "Ошибка сервиса SMS. Попробуйте позже",
  "Email is empty": "Email не указан",
  "Email exists": "Пользователь с таким email уже существует",
  "Email not found": "Email не найден",
  "Invalid email": "Неверный формат email",
  "User creation error": "Ошибка при создании пользователя",
  "Не заполнено название": "Не указано название",
  "Название не должно превышать 100 символов": "Название не должно превышать 100 символов",
  "Не найдено": "Объект не найден",
  "Role not found": "Роль не найдена",
};

export function getBackendErrorMessage(message: string): string {
  return backendErrorMessages[message] ?? message;
}
