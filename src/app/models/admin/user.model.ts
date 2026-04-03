export interface UserOutDto {
  id: number;
  phone: string;
  email: string;
  name: string;
  surname: string;
  startDate: string;
  role: string;
  avatar?: string | null;
}
