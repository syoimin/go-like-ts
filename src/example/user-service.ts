// example/user-service.ts
import {
    IResult,
    createSuccess,
    createError,
    TypeConverter,
    GoLikeValidator,
    ResultUtils,
    IUser,
    IUserCreateRequest
  } from '../types/go-like';
  
  // Go風のユーザーサービス実装例
  export class UserService {
    private readonly users: Map<number, IUser> = new Map();
    private nextId: number = 1;
  
    // ユーザー作成（Go風のエラーハンドリング）
    public createUser(request: IUserCreateRequest): IResult<IUser> {
      // バリデーション
      const nameValidation = this.validateName(request.name);
      if (!nameValidation.success) {
        return createError(nameValidation.error || 'Name validation failed');
      }
  
      const emailValidation = this.validateEmail(request.email);
      if (!emailValidation.success) {
        return createError(emailValidation.error || 'Email validation failed');
      }
  
      // 重複チェック
      const existingUserCheck = this.findUserByEmail(request.email);
      if (existingUserCheck.success) {
        return createError('User with this email already exists');
      }
  
      // ユーザー作成
      const user: IUser = {
        id: this.nextId++,
        name: request.name,
        email: request.email
      };
  
      this.users.set(user.id, user);
      return createSuccess(user);
    }
  
    // ユーザー取得
    public getUserById(id: string): IResult<IUser> {
      const idConversionResult = TypeConverter.toNumber(id);
      if (!idConversionResult.success) {
        return createError(`Invalid ID format: ${idConversionResult.error || 'unknown error'}`);
      }
  
      const numericId = idConversionResult.data;
      if (!GoLikeValidator.isNotUndefined(numericId)) {
        return createError('ID conversion resulted in undefined');
      }
  
      const user = this.users.get(numericId);
      if (!GoLikeValidator.isNotUndefined(user)) {
        return createError(`User not found with ID: ${String(numericId)}`);
      }
  
      return createSuccess(user);
    }
  
    // 全ユーザー取得
    public getAllUsers(): IResult<IUser[]> {
      const users = Array.from(this.users.values());
      return createSuccess(users);
    }
  
    // ユーザー更新
    public updateUser(id: string, updates: Partial<IUserCreateRequest>): IResult<IUser> {
      const getUserResult = this.getUserById(id);
      if (!getUserResult.success) {
        return createError(getUserResult.error || 'User not found');
      }
  
      const existingUser = getUserResult.data;
      if (!GoLikeValidator.isNotUndefined(existingUser)) {
        return createError('Retrieved user is undefined');
      }
  
      // バリデーション
      if (GoLikeValidator.isNotUndefined(updates.name)) {
        const nameValidation = this.validateName(updates.name);
        if (!nameValidation.success) {
          return createError(nameValidation.error || 'Name validation failed');
        }
      }
  
      if (GoLikeValidator.isNotUndefined(updates.email)) {
        const emailValidation = this.validateEmail(updates.email);
        if (!emailValidation.success) {
          return createError(emailValidation.error || 'Email validation failed');
        }
  
        // 他のユーザーが既に使用していないかチェック
        const existingEmailCheck = this.findUserByEmail(updates.email);
        if (existingEmailCheck.success && existingEmailCheck.data?.id !== existingUser.id) {
          return createError('Email is already in use by another user');
        }
      }
  
      // 更新
      const updatedUser: IUser = {
        id: existingUser.id,
        name: updates.name || existingUser.name,
        email: updates.email || existingUser.email
      };
  
      this.users.set(updatedUser.id, updatedUser);
      return createSuccess(updatedUser);
    }
  
    // ユーザー削除
    public deleteUser(id: string): IResult<boolean> {
      const idConversionResult = TypeConverter.toNumber(id);
      if (!idConversionResult.success) {
        return createError(`Invalid ID format: ${idConversionResult.error || 'unknown error'}`);
      }
  
      const numericId = idConversionResult.data;
      if (!GoLikeValidator.isNotUndefined(numericId)) {
        return createError('ID conversion resulted in undefined');
      }
  
      const exists = this.users.has(numericId);
      if (!exists) {
        return createError(`User not found with ID: ${String(numericId)}`);
      }
  
      this.users.delete(numericId);
      return createSuccess(true);
    }
  
    // プライベートヘルパーメソッド
    private validateName(name: string): IResult<boolean> {
      if (!GoLikeValidator.isNotEmpty(name)) {
        return createError('Name cannot be empty');
      }
  
      if (name.length > 50) {
        return createError('Name cannot exceed 50 characters');
      }
  
      return createSuccess(true);
    }
  
    private validateEmail(email: string): IResult<boolean> {
      if (!GoLikeValidator.isNotEmpty(email)) {
        return createError('Email cannot be empty');
      }
  
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return createError('Invalid email format');
      }
  
      return createSuccess(true);
    }
  
    private findUserByEmail(email: string): IResult<IUser> {
      const users = Array.from(this.users.values());
      const user = users.find((u: IUser): boolean => u.email === email);
  
      if (!GoLikeValidator.isNotUndefined(user)) {
        return createError('User not found');
      }
  
      return createSuccess(user);
    }
  }
  
  // 使用例
  export const demonstrateGoLikeTypescript = (): IResult<string> => {
    const userService = new UserService();
  
    // ユーザー作成
    const createResult = userService.createUser({
      name: 'John Doe',
      email: 'john@example.com'
    });
  
    if (!createResult.success) {
      return createError(`Failed to create user: ${createResult.error || 'unknown error'}`);
    }
  
    const user = createResult.data;
    if (!GoLikeValidator.isNotUndefined(user)) {
      return createError('Created user is undefined');
    }
  
    // ユーザー取得
    const getUserResult = userService.getUserById(String(user.id));
    if (!getUserResult.success) {
      return createError(`Failed to get user: ${getUserResult.error || 'unknown error'}`);
    }
  
    // Result型の操作例
    const userNameResult = ResultUtils.map(getUserResult, (userData: IUser): string => userData.name);
    
    const userName = ResultUtils.unwrapOr(userNameResult, 'Unknown');
    
    return createSuccess(`Successfully demonstrated Go-like TypeScript with user: ${userName}`);
  };