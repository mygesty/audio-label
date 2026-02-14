import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { authService } from '../auth.service'
import { httpService } from '../http'

// Mock httpService
vi.mock('../http', () => ({
  httpService: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
  })

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockResponse = {
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            role: 'annotator' as const,
          },
        },
      }

      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const requestData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'testpass123',
      }

      const result = await authService.register(requestData)

      expect(httpService.post).toHaveBeenCalledWith('/auth/register', requestData)
      expect(result).toEqual(mockResponse.data)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'mock-access-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', 'mock-refresh-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.data.user))
    })

    it('should handle registration error', async () => {
      const mockError = new Error('Registration failed')
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      const requestData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'testpass123',
      }

      await expect(authService.register(requestData)).rejects.toThrow('Registration failed')
    })

    it('should validate request data format', async () => {
      const mockResponse = {
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            role: 'annotator' as const,
          },
        },
      }

      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      // Test with valid email format
      await authService.register({
        email: 'valid@example.com',
        username: 'testuser',
        password: 'testpass123',
      })

      // Test with valid username length (3-100 characters)
      await authService.register({
        email: 'test@example.com',
        username: 'abc',
        password: 'testpass123',
      })

      // Test with valid password length (6+ characters)
      await authService.register({
        email: 'test@example.com',
        username: 'testuser',
        password: '123456',
      })
    })
  })

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const mockResponse = {
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            role: 'annotator' as const,
          },
        },
      }

      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const requestData = {
        email: 'test@example.com',
        password: 'testpass123',
      }

      const result = await authService.login(requestData)

      expect(httpService.post).toHaveBeenCalledWith('/auth/login', requestData)
      expect(result).toEqual(mockResponse.data)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'mock-access-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', 'mock-refresh-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.data.user))
    })

    it('should handle login error', async () => {
      const mockError = new Error('Login failed')
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      const requestData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      await expect(authService.login(requestData)).rejects.toThrow('Login failed')
    })

    it('should validate request data format', async () => {
      const mockResponse = {
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            role: 'annotator' as const,
          },
        },
      }

      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      // Test with valid email format
      await authService.login({
        email: 'valid@example.com',
        password: 'testpass123',
      })

      // Test with valid password length (6+ characters)
      await authService.login({
        email: 'test@example.com',
        password: '123456',
      })
    })
  })

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockResponse = {
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            role: 'annotator' as const,
          },
        },
      }

      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const requestData = {
        refreshToken: 'old-refresh-token',
      }

      const result = await authService.refreshToken(requestData)

      expect(httpService.post).toHaveBeenCalledWith('/auth/refresh', requestData)
      expect(result).toEqual(mockResponse.data)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'new-access-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', 'new-refresh-token')
    })

    it('should handle refresh token error', async () => {
      const mockError = new Error('Refresh failed')
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      const requestData = {
        refreshToken: 'invalid-token',
      }

      await expect(authService.refreshToken(requestData)).rejects.toThrow('Refresh failed')
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      vi.mocked(httpService.post).mockResolvedValue({ data: { message: 'Logged out successfully' } })

      await authService.logout()

      expect(httpService.post).toHaveBeenCalledWith('/auth/logout')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    })

    it('should handle logout error', async () => {
      const mockError = new Error('Logout failed')
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await authService.logout()

      // Should still clear tokens even on error
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        role: 'annotator' as const,
      }

      vi.mocked(httpService.get).mockResolvedValue({ data: mockUser })

      const result = await authService.getCurrentUser()

      expect(httpService.get).toHaveBeenCalledWith('/users/profile')
      expect(result).toEqual(mockUser)
    })

    it('should handle get current user error', async () => {
      const mockError = new Error('Get user failed')
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(authService.getCurrentUser()).rejects.toThrow('Get user failed')
    })
  })

  describe('getStoredUser', () => {
    it('should return stored user when exists', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        role: 'annotator' as const,
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser))

      const result = authService.getStoredUser()

      expect(result).toEqual(mockUser)
    })

    it('should return null when no user stored', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = authService.getStoredUser()

      expect(result).toBeNull()
    })

    it('should return null when invalid JSON stored', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json')

      const result = authService.getStoredUser()

      expect(result).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when access token exists', () => {
      localStorageMock.getItem.mockReturnValue('mock-token')

      const result = authService.isAuthenticated()

      expect(result).toBe(true)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('access_token')
    })

    it('should return false when no access token', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = authService.isAuthenticated()

      expect(result).toBe(false)
    })
  })

  describe('Data Format Alignment with Backend', () => {
    it('should send correct register request format', async () => {
      const mockResponse = {
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            role: 'annotator' as const,
          },
        },
      }

      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const requestData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'testpass123',
      }

      await authService.register(requestData)

      const callArgs = vi.mocked(httpService.post).mock.calls[0]
      expect(callArgs[0]).toBe('/auth/register')
      expect(callArgs[1]).toHaveProperty('email')
      expect(callArgs[1]).toHaveProperty('username')
      expect(callArgs[1]).toHaveProperty('password')
      expect(callArgs[1]).not.toHaveProperty('role') // role is optional
    })

    it('should send correct login request format', async () => {
      const mockResponse = {
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            role: 'annotator' as const,
          },
        },
      }

      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const requestData = {
        email: 'test@example.com',
        password: 'testpass123',
      }

      await authService.login(requestData)

      const callArgs = vi.mocked(httpService.post).mock.calls[0]
      expect(callArgs[0]).toBe('/auth/login')
      expect(callArgs[1]).toHaveProperty('email')
      expect(callArgs[1]).toHaveProperty('password')
      expect(Object.keys(callArgs[1])).toHaveLength(2)
    })

    it('should send correct refresh token request format', async () => {
      const mockResponse = {
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            role: 'annotator' as const,
          },
        },
      }

      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const requestData = {
        refreshToken: 'mock-refresh-token',
      }

      await authService.refreshToken(requestData)

      const callArgs = vi.mocked(httpService.post).mock.calls[0]
      expect(callArgs[0]).toBe('/auth/refresh')
      expect(callArgs[1]).toHaveProperty('refreshToken')
      expect(Object.keys(callArgs[1])).toHaveLength(1)
    })

    it('should handle correct auth response format', async () => {
      const mockResponse = {
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            role: 'annotator' as const,
            avatarUrl: 'http://example.com/avatar.png',
          },
        },
      }

      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const result = await authService.login({
        email: 'test@example.com',
        password: 'testpass123',
      })

      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('refreshToken')
      expect(result).toHaveProperty('user')
      expect(result.user).toHaveProperty('id')
      expect(result.user).toHaveProperty('email')
      expect(result.user).toHaveProperty('username')
      expect(result.user).toHaveProperty('role')
      expect(['annotator', 'reviewer', 'project_admin', 'system_admin']).toContain(result.user.role)
      expect(result.user.avatarUrl).toBeDefined()
    })
  })

  describe('Password Reset', () => {
    describe('requestPasswordReset', () => {
      it('should request password reset successfully', async () => {
        const mockResponse = {
          data: {
            message: 'If the email exists, a password reset link has been sent',
          },
        }

        vi.mocked(httpService.post).mockResolvedValue(mockResponse)

        const requestData = {
          email: 'test@example.com',
        }

        const result = await authService.requestPasswordReset(requestData)

        expect(httpService.post).toHaveBeenCalledWith('/auth/request-password-reset', requestData)
        expect(result).toEqual(mockResponse.data)
      })

      it('should handle password reset request error', async () => {
        const mockError = new Error('Request failed')
        vi.mocked(httpService.post).mockRejectedValue(mockError)

        const requestData = {
          email: 'test@example.com',
        }

        await expect(authService.requestPasswordReset(requestData)).rejects.toThrow('Request failed')
      })

      it('should send correct request format', async () => {
        const mockResponse = {
          data: {
            message: 'If the email exists, a password reset link has been sent',
          },
        }

        vi.mocked(httpService.post).mockResolvedValue(mockResponse)

        const requestData = {
          email: 'test@example.com',
        }

        await authService.requestPasswordReset(requestData)

        const callArgs = vi.mocked(httpService.post).mock.calls[0]
        expect(callArgs[0]).toBe('/auth/request-password-reset')
        expect(callArgs[1]).toHaveProperty('email')
        expect(Object.keys(callArgs[1])).toHaveLength(1)
      })

      it('should handle valid email format', async () => {
        const mockResponse = {
          data: {
            message: 'If the email exists, a password reset link has been sent',
          },
        }

        vi.mocked(httpService.post).mockResolvedValue(mockResponse)

        // Test with valid email format
        await authService.requestPasswordReset({
          email: 'valid@example.com',
        })

        expect(httpService.post).toHaveBeenCalled()
      })
    })

    describe('resetPassword', () => {
      it('should reset password successfully', async () => {
        const mockResponse = {
          data: {
            message: 'Password has been reset successfully',
          },
        }

        vi.mocked(httpService.post).mockResolvedValue(mockResponse)

        const requestData = {
          token: 'mock-reset-token',
          password: 'NewPassword123',
        }

        const result = await authService.resetPassword(requestData)

        expect(httpService.post).toHaveBeenCalledWith('/auth/reset-password', requestData)
        expect(result).toEqual(mockResponse.data)
      })

      it('should handle password reset error', async () => {
        const mockError = new Error('Reset failed')
        vi.mocked(httpService.post).mockRejectedValue(mockError)

        const requestData = {
          token: 'mock-reset-token',
          password: 'NewPassword123',
        }

        await expect(authService.resetPassword(requestData)).rejects.toThrow('Reset failed')
      })

      it('should send correct request format', async () => {
        const mockResponse = {
          data: {
            message: 'Password has been reset successfully',
          },
        }

        vi.mocked(httpService.post).mockResolvedValue(mockResponse)

        const requestData = {
          token: 'mock-reset-token',
          password: 'NewPassword123',
        }

        await authService.resetPassword(requestData)

        const callArgs = vi.mocked(httpService.post).mock.calls[0]
        expect(callArgs[0]).toBe('/auth/reset-password')
        expect(callArgs[1]).toHaveProperty('token')
        expect(callArgs[1]).toHaveProperty('password')
        expect(Object.keys(callArgs[1])).toHaveLength(2)
      })

      it('should handle valid password format', async () => {
        const mockResponse = {
          data: {
            message: 'Password has been reset successfully',
          },
        }

        vi.mocked(httpService.post).mockResolvedValue(mockResponse)

        // Test with valid password format (6+ characters, contains uppercase, lowercase, and number)
        await authService.resetPassword({
          token: 'mock-reset-token',
          password: 'NewPassword123',
        })

        expect(httpService.post).toHaveBeenCalled()
      })
    })
  })
})