// types/go-like.ts

// Go風の戻り値型定義
export interface IResult<T> {
    readonly success: boolean;
    readonly data?: T;
    readonly error?: string;
  }
  
  // 成功結果の生成
  export const createSuccess = <T>(data: T): IResult<T> => ({
    success: true,
    data
  });
  
  // エラー結果の生成
  export const createError = <T = never>(error: string): IResult<T> => ({
    success: false,
    error
  });
  
  // Go風の明示的型変換ユーティリティ
  export class TypeConverter {
    public static toNumber(value: unknown): IResult<number> {
      if (typeof value === 'number') {
        return createSuccess(value);
      }
      
      if (typeof value === 'string') {
        const parsed = Number(value);
        if (Number.isNaN(parsed)) {
          return createError(`Cannot convert "${value}" to number`);
        }
        return createSuccess(parsed);
      }
      
      return createError(`Cannot convert ${typeof value} to number`);
    }
  
    public static toString(value: unknown): IResult<string> {
      if (typeof value === 'string') {
        return createSuccess(value);
      }
      
      if (typeof value === 'number' || typeof value === 'boolean') {
        return createSuccess(String(value));
      }
      
      if (value === null) {
        return createSuccess('null');
      }
      
      if (value === undefined) {
        return createSuccess('undefined');
      }
      
      return createError(`Cannot convert ${typeof value} to string`);
    }
  
    public static toBoolean(value: unknown): IResult<boolean> {
      if (typeof value === 'boolean') {
        return createSuccess(value);
      }
      
      if (typeof value === 'string') {
        if (value.toLowerCase() === 'true') {
          return createSuccess(true);
        }
        if (value.toLowerCase() === 'false') {
          return createSuccess(false);
        }
        return createError(`Cannot convert "${value}" to boolean`);
      }
      
      if (typeof value === 'number') {
        if (value === 0) {
          return createSuccess(false);
        }
        if (value === 1) {
          return createSuccess(true);
        }
        return createError(`Cannot convert number ${value} to boolean`);
      }
      
      return createError(`Cannot convert ${typeof value} to boolean`);
    }
  }
  
  // Go風の条件チェックユーティリティ
  export class GoLikeValidator {
    public static isNotNull<T>(value: T | null): value is T {
      return value !== null;
    }
  
    public static isNotUndefined<T>(value: T | undefined): value is T {
      return value !== undefined;
    }
  
    public static isNotNullOrUndefined<T>(value: T | null | undefined): value is T {
      return value !== null && value !== undefined;
    }
  
    public static isEmpty(value: string): boolean {
      return value.length === 0;
    }
  
    public static isNotEmpty(value: string): boolean {
      return value.length > 0;
    }
  }
  
  // Go風のエラーハンドリング関数型
  export type ErrorHandler<T> = (error: string) => T;
  export type SuccessHandler<TInput, TOutput> = (data: TInput) => TOutput;
  
  // Result型の操作ユーティリティ
  export class ResultUtils {
    public static map<TInput, TOutput>(
      result: IResult<TInput>,
      mapper: SuccessHandler<TInput, TOutput>
    ): IResult<TOutput> {
      if (!result.success) {
        return createError(result.error || 'Unknown error');
      }
      
      if (GoLikeValidator.isNotUndefined(result.data)) {
        return createSuccess(mapper(result.data));
      }
      
      return createError('Data is undefined');
    }
  
    public static flatMap<TInput, TOutput>(
      result: IResult<TInput>,
      mapper: SuccessHandler<TInput, IResult<TOutput>>
    ): IResult<TOutput> {
      if (!result.success) {
        return createError(result.error || 'Unknown error');
      }
      
      if (GoLikeValidator.isNotUndefined(result.data)) {
        return mapper(result.data);
      }
      
      return createError('Data is undefined');
    }
  
    public static unwrapOr<T>(result: IResult<T>, defaultValue: T): T {
      return result.success && GoLikeValidator.isNotUndefined(result.data)
        ? result.data
        : defaultValue;
    }
  
    public static isError<T>(result: IResult<T>): result is IResult<T> & { success: false } {
      return !result.success;
    }
  
    public static isSuccess<T>(result: IResult<T>): result is IResult<T> & { success: true; data: T } {
      return result.success && GoLikeValidator.isNotUndefined(result.data);
    }
  }
  
  // Go風のHTTPクライアント例
  export class GoLikeHttpClient {
    public static async get<T>(url: string): Promise<IResult<T>> {
      const response = await fetch(url);
      
      if (!response.ok) {
        return createError(`HTTP error: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return createError('Response is not JSON');
      }
      
      const data = await response.json() as T;
      return createSuccess(data);
    }
  
    public static async post<TRequest, TResponse>(
      url: string,
      body: TRequest
    ): Promise<IResult<TResponse>> {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        return createError(`HTTP error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json() as TResponse;
      return createSuccess(data);
    }
  }
  
  // 使用例のための型
  export interface IUser {
    readonly id: number;
    readonly name: string;
    readonly email: string;
  }
  
  export interface IUserCreateRequest {
    readonly name: string;
    readonly email: string;
  }