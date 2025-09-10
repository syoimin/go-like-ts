export interface IResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
}

export const createSuccess = <T>(data: T): IResult<T> => ({
  success: true,
  data
});

export const createError = <T = never>(error: string): IResult<T> => ({
  success: false,
  error
});
