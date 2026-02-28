import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRole } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { env } from '../../config/env.js';
import { cache } from '../../config/redis.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import { JwtPayload, TokenPair } from '../../types/index.js';
import {
  RegisterInput,
  LoginInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from './auth.schema.js';

const BCRYPT_ROUNDS = 12;
const VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const RESET_TOKEN_EXPIRY = 1 * 60 * 60 * 1000; // 1 hour

export class AuthService {
  // Generate JWT tokens
  static generateTokens(userId: string, email: string, role: UserRole): TokenPair {
    const accessPayload: JwtPayload = {
      userId,
      email,
      role,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      userId,
      email,
      role,
      type: 'refresh',
    };

    const accessToken = jwt.sign(accessPayload, env.jwtAccessSecret, {
      expiresIn: env.jwtAccessExpiry,
    });

    const refreshToken = jwt.sign(refreshPayload, env.jwtRefreshSecret, {
      expiresIn: env.jwtRefreshExpiry,
    });

    return { accessToken, refreshToken };
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  // Compare password
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate random token
  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Hash token for storage
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // Register new user
  static async register(input: RegisterInput) {
    const { email, password, username, fullName, role } = input;

    // Check if email exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw ApiError.conflict('Email already registered');
    }

    // Check if username exists
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      throw ApiError.conflict('Username already taken');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        username,
        fullName,
        role: role as UserRole,
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    // Generate verification token
    const verificationToken = this.generateToken();
    const hashedToken = this.hashToken(verificationToken);

    // Store verification token in Redis
    await cache.set(
      `verify:${hashedToken}`,
      { userId: user.id },
      VERIFICATION_TOKEN_EXPIRY / 1000
    );

    // TODO: Send verification email
    logger.info('User registered', { userId: user.id, email: user.email });

    return {
      user,
      verificationToken, // In production, this would be sent via email
    };
  }

  // Login user
  static async login(input: LoginInput) {
    const { email, password } = input;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check password
    const isValid = await this.comparePassword(password, user.passwordHash);

    if (!isValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if banned
    if (user.isBanned) {
      throw ApiError.forbidden('Your account has been banned');
    }

    // Check if active
    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated');
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    // Store refresh token
    const hashedRefreshToken = this.hashToken(tokens.refreshToken);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    logger.info('User logged in', { userId: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isVerified: user.isVerified,
      },
      tokens,
    };
  }

  // Logout user
  static async logout(refreshToken: string): Promise<void> {
    const hashedToken = this.hashToken(refreshToken);
    await prisma.refreshToken.deleteMany({
      where: { token: hashedToken },
    });
  }

  // Refresh access token
  static async refreshTokens(refreshToken: string) {
    // Verify refresh token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(refreshToken, env.jwtRefreshSecret) as JwtPayload;
    } catch {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    if (decoded.type !== 'refresh') {
      throw ApiError.unauthorized('Invalid token type');
    }

    // Check if token exists in DB
    const hashedToken = this.hashToken(refreshToken);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw ApiError.unauthorized('Refresh token not found');
    }

    // Check if expired
    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw ApiError.unauthorized('Refresh token expired');
    }

    // Delete old refresh token (rotation)
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // Generate new tokens
    const user = storedToken.user;
    const tokens = this.generateTokens(user.id, user.email, user.role);

    // Store new refresh token
    const newHashedToken = this.hashToken(tokens.refreshToken);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: newHashedToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isVerified: user.isVerified,
      },
      tokens,
    };
  }

  // Verify email
  static async verifyEmail(token: string) {
    const hashedToken = this.hashToken(token);
    const data = await cache.get<{ userId: string }>(`verify:${hashedToken}`);

    if (!data) {
      throw ApiError.badRequest('Invalid or expired verification token');
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: data.userId },
      data: { isVerified: true },
      select: {
        id: true,
        email: true,
        username: true,
        isVerified: true,
      },
    });

    // Delete token
    await cache.del(`verify:${hashedToken}`);

    logger.info('Email verified', { userId: user.id });

    return user;
  }

  // Resend verification email
  static async resendVerification(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If an account exists, a verification email has been sent' };
    }

    if (user.isVerified) {
      throw ApiError.badRequest('Email is already verified');
    }

    // Generate new verification token
    const verificationToken = this.generateToken();
    const hashedToken = this.hashToken(verificationToken);

    await cache.set(
      `verify:${hashedToken}`,
      { userId: user.id },
      VERIFICATION_TOKEN_EXPIRY / 1000
    );

    // TODO: Send verification email

    return {
      message: 'Verification email sent',
      token: verificationToken, // In production, remove this
    };
  }

  // Forgot password
  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If an account exists, a reset email has been sent' };
    }

    // Generate reset token
    const resetToken = this.generateToken();
    const hashedToken = this.hashToken(resetToken);

    await cache.set(
      `reset:${hashedToken}`,
      { userId: user.id },
      RESET_TOKEN_EXPIRY / 1000
    );

    // TODO: Send reset email
    logger.info('Password reset requested', { userId: user.id });

    return {
      message: 'Password reset email sent',
      token: resetToken, // In production, remove this
    };
  }

  // Reset password
  static async resetPassword(input: ResetPasswordInput) {
    const { token, password } = input;
    const hashedToken = this.hashToken(token);

    const data = await cache.get<{ userId: string }>(`reset:${hashedToken}`);

    if (!data) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await this.hashPassword(password);

    // Update user
    await prisma.user.update({
      where: { id: data.userId },
      data: { passwordHash },
    });

    // Delete reset token
    await cache.del(`reset:${hashedToken}`);

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId: data.userId },
    });

    logger.info('Password reset completed', { userId: data.userId });

    return { message: 'Password reset successful' };
  }

  // Change password (authenticated)
  static async changePassword(userId: string, input: ChangePasswordInput) {
    const { currentPassword, newPassword } = input;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Verify current password
    const isValid = await this.comparePassword(currentPassword, user.passwordHash);

    if (!isValid) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await this.hashPassword(newPassword);

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    logger.info('Password changed', { userId });

    return { message: 'Password changed successfully' };
  }

  // Get current user
  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        bio: true,
        role: true,
        isVerified: true,
        stripeCustomerId: true,
        stripeAccountId: true,
        payoutEnabled: true,
        createdAt: true,
        _count: {
          select: {
            projects: true,
            ordersAsBuyer: true,
            ordersAsSeller: true,
          },
        },
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }
}
