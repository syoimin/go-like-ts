// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    transform: {
      '^.+\\.ts$': 'ts-jest'
    },
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/**/*.test.ts',
      '!src/**/*.spec.ts',
      '!src/index.ts'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    verbose: true
  };
  
  // src/test-setup.ts
  import { GoLikeValidator } from './types/go-like';
  
  // Go風のテストヘルパー
  export class TestHelper {
    public static assertSuccess<T>(result: { success: boolean; data?: T; error?: string }): T {
      if (!result.success) {
        throw new Error(`Expected success but got error: ${result.error || 'unknown'}`);
      }
      if (!GoLikeValidator.isNotUndefined(result.data)) {
        throw new Error('Expected data to be defined in successful result');
      }
      return result.data;
    }
  
    public static assertError<T>(result: { success: boolean; data?: T; error?: string }): string {
      if (result.success) {
        throw new Error('Expected error but got success');
      }
      if (!GoLikeValidator.isNotUndefined(result.error)) {
        throw new Error('Expected error message to be defined');
      }
      return result.error;
    }
  }
  
  // src/__tests__/user-service.test.ts
  import { UserService } from '../example/user-service';
  import { TestHelper } from '../test-setup';
  import { IUserCreateRequest } from '../types/go-like';
  
  describe('UserService', (): void => {
    let userService: UserService;
  
    beforeEach((): void => {
      userService = new UserService();
    });
  
    describe('createUser', (): void => {
      it('should create user successfully with valid data', (): void => {
        // Arrange
        const request: IUserCreateRequest = {
          name: 'John Doe',
          email: 'john@example.com'
        };
  
        // Act
        const result = userService.createUser(request);
  
        // Assert
        const user = TestHelper.assertSuccess(result);
        expect(user.name).toBe(request.name);
        expect(user.email).toBe(request.email);
        expect(user.id).toBeGreaterThan(0);
      });
  
      it('should return error for empty name', (): void => {
        // Arrange
        const request: IUserCreateRequest = {
          name: '',
          email: 'john@example.com'
        };
  
        // Act
        const result = userService.createUser(request);
  
        // Assert
        const error = TestHelper.assertError(result);
        expect(error).toContain('Name cannot be empty');
      });
  
      it('should return error for invalid email format', (): void => {
        // Arrange
        const request: IUserCreateRequest = {
          name: 'John Doe',
          email: 'invalid-email'
        };
  
        // Act
        const result = userService.createUser(request);
  
        // Assert
        const error = TestHelper.assertError(result);
        expect(error).toContain('Invalid email format');
      });
  
      it('should return error for duplicate email', (): void => {
        // Arrange
        const request: IUserCreateRequest = {
          name: 'John Doe',
          email: 'john@example.com'
        };
        TestHelper.assertSuccess(userService.createUser(request));
  
        const duplicateRequest: IUserCreateRequest = {
          name: 'Jane Doe',
          email: 'john@example.com'
        };
  
        // Act
        const result = userService.createUser(duplicateRequest);
  
        // Assert
        const error = TestHelper.assertError(result);
        expect(error).toContain('User with this email already exists');
      });
    });
  
    describe('getUserById', (): void => {
      it('should get user successfully with valid ID', (): void => {
        // Arrange
        const createRequest: IUserCreateRequest = {
          name: 'John Doe',
          email: 'john@example.com'
        };
        const createdUser = TestHelper.assertSuccess(userService.createUser(createRequest));
  
        // Act
        const result = userService.getUserById(String(createdUser.id));
  
        // Assert
        const user = TestHelper.assertSuccess(result);
        expect(user.id).toBe(createdUser.id);
        expect(user.name).toBe(createdUser.name);
        expect(user.email).toBe(createdUser.email);
      });
  
      it('should return error for invalid ID format', (): void => {
        // Act
        const result = userService.getUserById('invalid-id');
  
        // Assert
        const error = TestHelper.assertError(result);
        expect(error).toContain('Invalid ID format');
      });
  
      it('should return error for non-existent ID', (): void => {
        // Act
        const result = userService.getUserById('999');
  
        // Assert
        const error = TestHelper.assertError(result);
        expect(error).toContain('User not found with ID: 999');
      });
    });
  
    describe('updateUser', (): void => {
      it('should update user name successfully', (): void => {
        // Arrange
        const createRequest: IUserCreateRequest = {
          name: 'John Doe',
          email: 'john@example.com'
        };
        const createdUser = TestHelper.assertSuccess(userService.createUser(createRequest));
  
        // Act
        const result = userService.updateUser(String(createdUser.id), { name: 'Jane Doe' });
  
        // Assert
        const updatedUser = TestHelper.assertSuccess(result);
        expect(updatedUser.name).toBe('Jane Doe');
        expect(updatedUser.email).toBe(createdUser.email);
        expect(updatedUser.id).toBe(createdUser.id);
      });
  
      it('should return error when updating to duplicate email', (): void => {
        // Arrange
        const user1 = TestHelper.assertSuccess(userService.createUser({
          name: 'John Doe',
          email: 'john@example.com'
        }));
  
        const user2 = TestHelper.assertSuccess(userService.createUser({
          name: 'Jane Doe',
          email: 'jane@example.com'
        }));
  
        // Act
        const result = userService.updateUser(String(user2.id), { email: 'john@example.com' });
  
        // Assert
        const error = TestHelper.assertError(result);
        expect(error).toContain('Email is already in use by another user');
      });
    });
  
    describe('deleteUser', (): void => {
      it('should delete user successfully', (): void => {
        // Arrange
        const createRequest: IUserCreateRequest = {
          name: 'John Doe',
          email: 'john@example.com'
        };
        const createdUser = TestHelper.assertSuccess(userService.createUser(createRequest));
  
        // Act
        const deleteResult = userService.deleteUser(String(createdUser.id));
  
        // Assert
        const success = TestHelper.assertSuccess(deleteResult);
        expect(success).toBe(true);
  
        // Verify user is deleted
        const getUserResult = userService.getUserById(String(createdUser.id));
        TestHelper.assertError(getUserResult);
      });
  
      it('should return error for non-existent user', (): void => {
        // Act
        const result = userService.deleteUser('999');
  
        // Assert
        const error = TestHelper.assertError(result);
        expect(error).toContain('User not found with ID: 999');
      });
    });
  
    describe('getAllUsers', (): void => {
      it('should return empty array when no users', (): void => {
        // Act
        const result = userService.getAllUsers();
  
        // Assert
        const users = TestHelper.assertSuccess(result);
        expect(users).toHaveLength(0);
      });
  
      it('should return all created users', (): void => {
        // Arrange
        const user1 = TestHelper.assertSuccess(userService.createUser({
          name: 'John Doe',
          email: 'john@example.com'
        }));
  
        const user2 = TestHelper.assertSuccess(userService.createUser({
          name: 'Jane Doe',
          email: 'jane@example.com'
        }));
  
        // Act
        const result = userService.getAllUsers();
  
        // Assert
        const users = TestHelper.assertSuccess(result);
        expect(users).toHaveLength(2);
        expect(users).toContainEqual(user1);
        expect(users).toContainEqual(user2);
      });
    });
});