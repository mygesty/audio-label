import axios, { AxiosError } from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// 扩展 AxiosRequestConfig 类型以支持 _retry 属性
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean
}

// 刷新令牌响应类型
interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    username: string
    role: string
    avatarUrl?: string
  }
}

class HttpService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // 请求拦截器 - 添加 Token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器 - 处理错误和 Token 刷新
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig

        // Token 过期，尝试刷新
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true
          
          try {
            const refreshToken = localStorage.getItem('refresh_token')
            if (!refreshToken) {
              throw error
            }

            // 刷新 Token
            const response = await this.client.post<RefreshTokenResponse>('/auth/refresh', { refreshToken })
            const { accessToken, refreshToken: newRefreshToken } = response.data

            // 存储新 Token
            localStorage.setItem('access_token', accessToken)
            localStorage.setItem('refresh_token', newRefreshToken)

            // 重试原始请求
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return this.client(originalRequest)
          } catch (refreshError) {
            // 刷新失败，清除 Token 并跳转登录
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    console.log(`🌐 HTTP GET Request: ${url}`, config?.params || {})
    return this.client.get<T>(url, config).then(response => {
      console.log(`✅ HTTP GET Response (${url}):`, response.data)
      return response
    }).catch(error => {
      console.error(`❌ HTTP GET Error (${url}):`, error.message)
      console.error('Error details:', error.response?.data)
      throw error
    })
  }

  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config)
  }

  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config)
  }

  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config)
  }

  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config)
  }
}

export const httpService = new HttpService()
export default httpService