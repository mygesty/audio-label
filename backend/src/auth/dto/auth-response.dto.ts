import { UserRole } from '../../users/entities/user.entity';

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: UserRole;
    avatarUrl?: string;
  };
}