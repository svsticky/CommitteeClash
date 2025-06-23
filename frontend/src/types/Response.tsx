export type Response<T> = {
  succeed: boolean;
  data?: T;
  error?: string;
  status?: number;
};
