import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

const makeUser = (overrides = {}) => ({
  _id: new Types.ObjectId(),
  name: 'Test User',
  email: 'test@example.com',
  passwordHash: '$2b$12$placeholder',
  role: 'customer',
  ...overrides,
});

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = { findByEmail: jest.fn(), create: jest.fn() };
  const mockJwtService   = { sign: jest.fn().mockReturnValue('mock-token') };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService,   useValue: mockJwtService  },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── validateUser ─────────────────────────────────────────────────────────────

  describe('validateUser', () => {
    it('returns the user when password is correct', async () => {
      const hash = await bcrypt.hash('secret', 10);
      const user = makeUser({ passwordHash: hash });
      mockUsersService.findByEmail.mockResolvedValue(user);

      const result = await service.validateUser('test@example.com', 'secret');
      expect(result).toBe(user);
    });

    it('returns null when the password is wrong', async () => {
      const hash = await bcrypt.hash('correct', 10);
      mockUsersService.findByEmail.mockResolvedValue(makeUser({ passwordHash: hash }));

      const result = await service.validateUser('test@example.com', 'wrong');
      expect(result).toBeNull();
    });

    it('returns null when the user does not exist', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      const result = await service.validateUser('nobody@example.com', 'anything');
      expect(result).toBeNull();
    });
  });

  // ── signup ────────────────────────────────────────────────────────────────────

  describe('signup', () => {
    it('throws ConflictException when the email is already registered', async () => {
      mockUsersService.findByEmail.mockResolvedValue(makeUser());

      await expect(
        service.signup({ name: 'Dup', email: 'test@example.com', password: 'pass1234' }),
      ).rejects.toThrow(ConflictException);
    });

    it('stores a bcrypt hash — never the plaintext password', async () => {
      const plaintext = 'plaintext123';
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockImplementation(async (data: { passwordHash: string }) => ({
        ...makeUser(),
        passwordHash: data.passwordHash,
      }));

      await service.signup({ name: 'New', email: 'new@example.com', password: plaintext });

      const { passwordHash } = mockUsersService.create.mock.calls[0][0];
      expect(passwordHash).not.toBe(plaintext);
      expect(passwordHash).toMatch(/^\$2[ab]\$/);
      expect(await bcrypt.compare(plaintext, passwordHash)).toBe(true);
    });

    it('returns an access_token and user object on success', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(makeUser({ email: 'new@example.com' }));

      const result = await service.signup({ name: 'New', email: 'new@example.com', password: 'pass1234' });

      expect(result).toHaveProperty('access_token', 'mock-token');
      expect(result.user).toMatchObject({ email: 'new@example.com', role: 'customer' });
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('returns an access_token for a valid user', async () => {
      const user = makeUser() as any;
      const result = await service.login(user);
      expect(result).toHaveProperty('access_token');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: expect.any(String), email: user.email }),
      );
    });
  });
});
