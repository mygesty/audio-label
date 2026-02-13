export type UserRole = 'annotator' | 'reviewer' | 'project_admin' | 'system_admin'
export type UserStatus = 'active' | 'inactive' | 'suspended'

export interface User {
  id: string
  email: string
  username: string
  role: UserRole
  avatarUrl?: string
  status?: UserStatus
  createdAt?: Date
  updatedAt?: Date
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  role?: UserRole
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RefreshRequest {
  refreshToken: string
}