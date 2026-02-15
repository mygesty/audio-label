// 音频状态枚举
export enum AudioStatus {
  UPLOADING = 'uploading',
  READY = 'ready',
  PROCESSING = 'processing',
  ERROR = 'error',
}

// 音频文件夹
export interface AudioFolder {
  id: string;
  projectId: string;
  parentId: string | null;
  name: string;
  description: string | null;
  createdBy: string;
  creator?: {
    id: string;
    username: string;
  };
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// 音频文件
export interface AudioFile {
  id: string;
  projectId: string;
  folderId: string | null;
  name: string;
  filePath: string;
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
  folder?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// 创建音频文件夹 DTO
export interface CreateAudioFolderDto {
  name: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  projectId: string;
}

// 更新音频文件夹 DTO
export interface UpdateAudioFolderDto {
  name?: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
}

// 创建音频文件 DTO
export interface CreateAudioFileDto {
  name: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  duration?: number;
  sampleRate?: number;
  channels?: number;
  bitRate?: number;
  folderId?: string;
  metadata?: Record<string, any>;
}

// 更新音频文件 DTO
export interface UpdateAudioFileDto {
  name?: string;
  filePath?: string;
  fileSize?: number;
  fileType?: string;
  duration?: number;
  sampleRate?: number;
  channels?: number;
  bitRate?: number;
  folderId?: string;
  metadata?: Record<string, any>;
}

// 查询音频文件 DTO
export interface QueryAudioFileDto {
  projectId?: string;
  folderId?: string;
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
  folderId: string | null;
  name: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  status: AudioStatus;
  uploadProgress: number;
  createdAt: string;
}

// 统计信息响应
export interface AudioStatsResponse {
  projectId?: string;
  folderId?: string;
  count: number;
}