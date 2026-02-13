import { UserRole } from '../entities/user.entity';

export class ProfileResponseDto {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatarUrl?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}