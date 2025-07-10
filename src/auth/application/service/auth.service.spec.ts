import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { User } from '@user/domain/user';
import { AuthService } from '@auth/application/service/auth.service';
import {
  USER_USE_CASE,
  UserUseCase,
} from '@user/application/port/in/user.use-case';
import { MockServices } from '../../../../test/utils/mocks/service.mock';
import { DomainUserFactory } from '../../../../test/utils/factories/domain-user.factory';
import { AuthHelper } from '../../../../test/utils/helpers/auth.helper';

describe('AuthService', () => {
  let service: AuthService;
  let userUseCaseMock: jest.Mocked<UserUseCase>;
  let jwtServiceMock: jest.Mocked<JwtService>;

  const TEST_USER_EMAIL = 'test@example.com';
  const TEST_USER_PASSWORD = 'password123';
  const TEST_USER_ID = '1';
  const ACCESS_TOKEN = 'accessToken';
  const REFRESH_TOKEN = 'refreshToken';
  const NEW_ACCESS_TOKEN = 'newAccessToken';
  const NEW_REFRESH_TOKEN = 'newRefreshToken';
  const TOKEN_EXPIRY_7_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  beforeEach(async () => {
    // Create mocks using test utilities
    userUseCaseMock = createUserUseCaseMock();
    jwtServiceMock = MockServices.jwtService() as jest.Mocked<JwtService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USER_USE_CASE, useValue: userUseCaseMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.resetAllMocks();
    DomainUserFactory.reset();
  });

  describe('register', () => {
    const createRegisterCommand = (email = TEST_USER_EMAIL, password = TEST_USER_PASSWORD) => ({
      email,
      password,
    });

    const setupSuccessfulRegistration = async () => {
      const hashedPassword = await AuthHelper.hashPassword(TEST_USER_PASSWORD);
      const savedUser = new User(
        TEST_USER_ID,
        TEST_USER_EMAIL,
        hashedPassword,
        2000,
        new Date(),
        new Date(),
      );
      
      userUseCaseMock.findByEmail.mockResolvedValue(null);
      userUseCaseMock.create.mockResolvedValue(savedUser);
      jwtServiceMock.sign
        .mockReturnValueOnce(ACCESS_TOKEN)
        .mockReturnValueOnce(REFRESH_TOKEN);

      return savedUser;
    };

    it('should register a new user and return tokens', async () => {
      // Arrange
      const registerCommand = createRegisterCommand();
      const savedUser = await setupSuccessfulRegistration();

      // Act
      const result = await service.register(registerCommand);

      // Assert
      expect(result).toMatchObject({
        user: {
          id: savedUser.id,
          email: savedUser.email,
        },
        accessToken: ACCESS_TOKEN,
        refreshToken: REFRESH_TOKEN,
      });
      
      expect(userUseCaseMock.findByEmail).toHaveBeenCalledWith(TEST_USER_EMAIL);
      expect(userUseCaseMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: TEST_USER_EMAIL,
          password: expect.any(String),
        }),
      );
      expect(jwtServiceMock.sign).toHaveBeenCalledTimes(2);
      expect(userUseCaseMock.saveRefreshToken).toHaveBeenCalledWith(
        savedUser.id,
        REFRESH_TOKEN,
        expect.any(Date),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      // Arrange
      const registerCommand = createRegisterCommand();
      const existingUser = DomainUserFactory.create({
        email: TEST_USER_EMAIL,
      });
      userUseCaseMock.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.register(registerCommand)).rejects.toThrow(
        ConflictException,
      );
      expect(userUseCaseMock.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const createLoginCommand = (email = TEST_USER_EMAIL, password = TEST_USER_PASSWORD) => ({
      email,
      password,
    });

    const setupUserWithPassword = async (password: string) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      return new User(
        TEST_USER_ID,
        TEST_USER_EMAIL,
        hashedPassword,
        2000,
        new Date(),
        new Date(),
      );
    };

    const setupSuccessfulLogin = () => {
      jwtServiceMock.sign
        .mockReturnValueOnce(ACCESS_TOKEN)
        .mockReturnValueOnce(REFRESH_TOKEN);
    };

    it('should return tokens and user for valid credentials', async () => {
      // Arrange
      const loginCommand = createLoginCommand();
      const user = await setupUserWithPassword(TEST_USER_PASSWORD);
      userUseCaseMock.findByEmail.mockResolvedValue(user);
      setupSuccessfulLogin();

      // Act
      const result = await service.login(loginCommand);

      // Assert
      expect(result).toMatchObject({
        accessToken: ACCESS_TOKEN,
        refreshToken: REFRESH_TOKEN,
        user: {
          id: user.id,
          email: user.email,
        },
      });
      expect(userUseCaseMock.findByEmail).toHaveBeenCalledWith(TEST_USER_EMAIL);
      expect(jwtServiceMock.sign).toHaveBeenCalledTimes(2);
      expect(userUseCaseMock.saveRefreshToken).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      // Arrange
      const loginCommand = createLoginCommand(TEST_USER_EMAIL, 'wrongpassword');
      const user = await setupUserWithPassword(TEST_USER_PASSWORD);
      userUseCaseMock.findByEmail.mockResolvedValue(user);

      // Act & Assert
      await expect(service.login(loginCommand)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtServiceMock.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      // Arrange
      const loginCommand = createLoginCommand('nonexistent@example.com');
      userUseCaseMock.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginCommand)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtServiceMock.sign).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    const createRefreshTokenCommand = (token = REFRESH_TOKEN) => ({
      refreshToken: token,
    });

    const setupValidRefreshToken = () => {
      const user = DomainUserFactory.create();
      const storedRefreshToken = {
        token: REFRESH_TOKEN,
        expiresAt: new Date(Date.now() + TOKEN_EXPIRY_7_DAYS_MS),
      };

      jwtServiceMock.verify.mockReturnValue({
        sub: user.id,
        email: user.email,
      });
      userUseCaseMock.findRefreshToken.mockResolvedValue(storedRefreshToken);
      userUseCaseMock.findById.mockResolvedValue(user);
      jwtServiceMock.sign
        .mockReturnValueOnce(NEW_ACCESS_TOKEN)
        .mockReturnValueOnce(NEW_REFRESH_TOKEN);

      return user;
    };

    it('should refresh tokens successfully', async () => {
      // Arrange
      const refreshTokenCommand = createRefreshTokenCommand();
      const user = setupValidRefreshToken();

      // Act
      const result = await service.refreshToken(refreshTokenCommand);

      // Assert
      expect(result).toEqual({
        accessToken: NEW_ACCESS_TOKEN,
        refreshToken: NEW_REFRESH_TOKEN,
      });
      expect(userUseCaseMock.deleteRefreshToken).toHaveBeenCalledWith(user.id);
      expect(userUseCaseMock.saveRefreshToken).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      // Arrange
      const refreshTokenCommand = createRefreshTokenCommand('invalidRefreshToken');
      jwtServiceMock.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(service.refreshToken(refreshTokenCommand)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      // Arrange
      const refreshTokenCommand = createRefreshTokenCommand();
      const user = DomainUserFactory.create();
      const expiredRefreshToken = {
        token: REFRESH_TOKEN,
        expiresAt: new Date(Date.now() - 1000), // Expired
      };

      jwtServiceMock.verify.mockReturnValue({
        sub: user.id,
        email: user.email,
      });
      userUseCaseMock.findRefreshToken.mockResolvedValue(expiredRefreshToken);

      // Act & Assert
      await expect(service.refreshToken(refreshTokenCommand)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userUseCaseMock.findById).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // Arrange
      const userId = TEST_USER_ID;

      // Act
      await service.logout(userId);

      // Assert
      expect(userUseCaseMock.deleteRefreshToken).toHaveBeenCalledWith(userId);
    });
  });
});

// Helper function to create UserUseCase mock
function createUserUseCaseMock(): jest.Mocked<UserUseCase> {
  return {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    saveRefreshToken: jest.fn(),
    findRefreshToken: jest.fn(),
    deleteRefreshToken: jest.fn(),
    updateTargetCalories: jest.fn(),
    getUserInfo: jest.fn(),
  };
}