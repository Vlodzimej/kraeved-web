export interface KraevedResponse<T = unknown> {
  requestUrl: string;
  data: T;
  statusCode: number;
}
