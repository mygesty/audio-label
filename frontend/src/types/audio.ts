// 音频状态枚举
export enum AudioStatus {
  UPLOADING = 'uploading',
  READY = 'ready',
  PROCESSING = 'processing',
  ERROR = 'error',
}

// 音频文件
export interface AudioFile {
  id: string;
  projectId: string;
  name: string;
  storagePath: string;
  storageKey?: string | null;
  fileSize: number;
  fileType: string;
  duration: number | null;
  sampleRate: number | null;
  channels: number | null;
  bitRate: number | null;
  metadata: Record<string, any>;
  status: AudioStatus;
  errorMessage: string | null;
  createdBy: string;
  creator?: {
    id: string;
    username: string;
  };
  uploadProgress: number;
  project?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// 创建音频文件 DTO
export interface CreateAudioFileDto {
  name: string;
  storagePath: string;
  storageKey?: string;
  fileSize: number;
  fileType: string;
  duration?: number;
  sampleRate?: number;
  channels?: number;
  bitRate?: number;
  metadata?: Record<string, any>;
}

// 更新音频文件 DTO
export interface UpdateAudioFileDto {
  name?: string;
  storagePath?: string;
  fileSize?: number;
  fileType?: string;
  duration?: number;
  sampleRate?: number;
  channels?: number;
  bitRate?: number;
  metadata?: Record<string, any>;
}

// 查询音频文件 DTO
export interface QueryAudioFileDto {
  projectId?: string;
  name?: string;
  status?: AudioStatus;
  fileType?: string;
  page?: number;
  pageSize?: number;
}

// 音频文件列表响应
export interface AudioFileListResponse {
  data: AudioFile[];
  total: number;
  page: number;
  pageSize: number;
}

// 上传音频文件响应
export interface UploadAudioResponse {
  id: string;
  projectId: string;
  name: string;
  storagePath: string;
  fileSize: number;
  fileType: string;
  status: AudioStatus;
  uploadProgress: number;
  createdAt: string;
}

// 统计信息响应
export interface AudioStatsResponse {
  projectId?: string;
  count: number;
}