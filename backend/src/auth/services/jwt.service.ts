import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class JwtAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(user: User): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload as any);
    const refreshToken = this.jwtService.sign(payload as any, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    const payload = await this.verifyRefreshToken(refreshToken);

    // In a real application, you would verify that the refresh token
    // is still valid and hasn't been revoked from the database

    const accessToken = this.jwtService.sign(
      { sub: payload.sub, email: payload.email, role: payload.role } as any,
    );

    return { accessToken, refreshToken };
  }

  async generateResetToken(userId: string): Promise<string> {
    // Generate a random token using JWT with expiration
    const token = this.jwtService.sign(
      { sub: userId, type: 'password_reset' } as any,
      { expiresIn: '1h' },
    );

    return token;
  }

  async verifyResetToken(token: string): Promise<{ userId: string }> {
    try {
      const payload = this.jwtService.verify(token);

      // Verify this is a password reset token
      if (payload.type !== 'password_reset') {
        throw new UnauthorizedException('Invalid token type');
      }

      return { userId: payload.sub };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }
}