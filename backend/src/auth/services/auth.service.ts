import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../../users/entities/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { RequestPasswordResetDto } from '../dto/request-password-reset.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { JwtAuthService } from './jwt.service';
import { PasswordService } from './password.service';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtAuthService: JwtAuthService,
    private readonly passwordService: PasswordService,
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: registerDto.email },
        { username: registerDto.username },
      ],
    });

    if (existingUser) {
      if (existingUser.email === registerDto.email) {
        throw new ConflictException('该邮箱已被注册');
      }
      throw new ConflictException('该用户名已被使用');
    }

    // Hash password
    const passwordHash = await this.passwordService.hashPassword(registerDto.password);

    // Create new user
    const user = this.userRepository.create({
      email: registerDto.email,
      username: registerDto.username,
      passwordHash,
      role: registerDto.role || UserRole.ANNOTATOR,
      status: UserStatus.ACTIVE,
    });

    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.jwtAuthService.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // Check user status
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('账号未激活，请联系管理员');
    }

    // Verify password
    const isPasswordValid = await this.passwordService.comparePassword(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.jwtAuthService.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async refresh(refreshDto: RefreshDto): Promise<AuthResponseDto> {
    // Verify refresh token
    const payload = await this.jwtAuthService.verifyRefreshToken(refreshDto.refreshToken);

    // Find user
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('账号未激活，请联系管理员');
    }

    // Generate new tokens
    const tokens = await this.jwtAuthService.refreshTokens(refreshDto.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async logout(userId: string): Promise<void> {
    // In a real application, you would invalidate the refresh token
    // This could be done by storing it in a database or a blacklist
    // For now, we'll just return success
    return;
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('账号未激活，请联系管理员');
    }

    return user;
  }

  async requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto): Promise<{ message: string }> {
    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: requestPasswordResetDto.email },
    });

    if (!user) {
      // Don't reveal that user doesn't exist
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    // Check user status
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('账号未激活，请联系管理员');
    }

    // Generate reset token
    const resetToken = await this.jwtAuthService.generateResetToken(user.id);

    // Set token expiration (1 hour)
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    // Save reset token and expiration
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await this.userRepository.save(user);

    // Send password reset email
    try {
      await this.mailService.sendPasswordResetEmail(user.email, resetToken, user.username);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Continue even if email fails, as the token is already saved
    }

    return { message: 'If the email exists, a password reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    // Find user with valid reset token
    const user = await this.userRepository.findOne({
      where: { passwordResetToken: resetPasswordDto.token },
    });

    if (!user) {
      throw new BadRequestException('重置链接无效或已过期，请重新申请密码重置');
    }

    // Check if token has expired
    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('重置链接无效或已过期，请重新申请密码重置');
    }

    // Check user status
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('账号未激活，请联系管理员');
    }

    // Hash new password
    const passwordHash = await this.passwordService.hashPassword(resetPasswordDto.password);

    // Update password and clear reset token
    user.passwordHash = passwordHash;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);

    return { message: 'Password has been reset successfully' };
  }
}