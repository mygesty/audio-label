import { httpService } from './http'
import type { AuthResponse, RegisterRequest, LoginRequest, RefreshRequest, User } from '../types/user'

export class AuthService {
  // 用户注册
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await httpService.post<AuthResponse>('/auth/register', data)
    this.saveTokens(response.data)
    return response.data
  }

  // 用户登录
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await httpService.post<AuthResponse>('/auth/login', data)
    this.saveTokens(response.data)
    return response.data
  }

  // 刷新令牌
  async refreshToken(data: RefreshRequest): Promise<AuthResponse> {
    const response = await httpService.post<AuthResponse>('/auth/refresh', data)
    this.saveTokens(response.data)
    return response.data
  }

  // 登出
  async logout(): Promise<void> {
    await httpService.post('/auth/logout')
    this.clearTokens()
  }

  // 获取当前用户信息
  async getCurrentUser(): Promise<User> {
    const response = await httpService.get<User>('/users/profile')
    return response.data
  }

  // 保存认牌
  private saveTokens(data: AuthResponse): void {
    localStorage.setItem('access_token', data.accessToken)
    localStorage.setItem('refresh_token', data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  // 清除令牌
  private clearTokens(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  }

  // 获取存储的用户信息
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        return JSON.parse(userStr) as User
      } catch {
        return null
      }
    }
    return null
  }

  // 检查是否已登录
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token')
  }
}

export const authService = new AuthService()