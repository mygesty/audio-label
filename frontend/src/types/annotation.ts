/**
 * 标注相关类型定义
 */

/**
 * 标注类型
 */
export interface AnnotationType {
  id: string
  name: string
  color: string
  visible: boolean
  createdAt: string
}

/**
 * 标注
 */
export interface Annotation {
  id: string
  audioId: string
  type: string // 关联到 AnnotationType.id
  startTime: number
  endTime: number
  text: string
  createdAt: string
  updatedAt: string
}

/**
 * 创建标注请求
 */
export interface CreateAnnotationRequest {
  audioId: string
  type: string
  startTime: number
  endTime: number
  text: string
}

/**
 * 更新标注请求
 */
export interface UpdateAnnotationRequest {
  type?: string
  startTime?: number
  endTime?: number
  text?: string
}

/**
 * 标注类型请求
 */
export interface CreateAnnotationTypeRequest {
  name: string
  color: string
}

/**
 * 更新标注类型请求
 */
export interface UpdateAnnotationTypeRequest {
  name?: string
  color?: string
  visible?: boolean
}

/**
 * 标注查询参数
 */
export interface QueryAnnotationsRequest {
  audioId?: string
  type?: string
  page?: number
  pageSize?: number
}

/**
 * 标注响应
 */
export interface AnnotationsResponse {
  data: Annotation[]
  total: number
  page: number
  pageSize: number
}

/**
 * 标注类型响应
 */
export interface AnnotationTypesResponse {
  data: AnnotationType[]
  total: number
}