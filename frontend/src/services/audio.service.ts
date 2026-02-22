import http from './http';
import type {
  AudioFile,
  CreateAudioFileDto,
  UpdateAudioFileDto,
  QueryAudioFileDto,
  AudioFileListResponse,
  UploadAudioResponse,
  AudioStatsResponse,
} from '../types/audio';

/**
 * 音频服务
 */
class AudioService {
  private readonly basePath = '/audio';

  // ============ 音频文件管理 ============

  /**
   * 上传音频文件
   */
  async uploadFile(
    file: File,
    projectId: string,
    storagePath?: string,
    onUploadProgress?: (progress: number) => void,
  ): Promise<UploadAudioResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    if (storagePath) {
      formData.append('storagePath', storagePath);
    }

    const response = await http.post<UploadAudioResponse>(
      `${this.basePath}/upload`,
      formData,
      {
        headers: {
          'Content-Type': undefined, // 让 axios 自动设置 boundary
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onUploadProgress(progress);
          }
        },
      },
    );

    return response.data;
  }

  /**
   * 获取音频文件列表
   */
  async getAudioFiles(
    query: QueryAudioFileDto,
  ): Promise<AudioFileListResponse> {
    const response = await http.get<AudioFileListResponse>(
      this.basePath,
      { params: query },
    );
    return response.data;
  }

  /**
   * 获取音频文件详情
   */
  async getAudioFileById(id: string): Promise<AudioFile> {
    const response = await http.get<AudioFile>(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * 更新音频文件
   */
  async updateAudioFile(
    id: string,
    data: UpdateAudioFileDto,
  ): Promise<AudioFile> {
    const response = await http.patch<AudioFile>(
      `${this.basePath}/${id}`,
      data,
    );
    return response.data;
  }

  /**
   * 删除音频文件
   */
  async deleteAudioFile(id: string): Promise<void> {
    await http.delete(`${this.basePath}/${id}`);
  }

  /**
   * 更新上传进度
   */
  async updateUploadProgress(
    id: string,
    progress: number,
  ): Promise<AudioFile> {
    const response = await http.patch<AudioFile>(
      `${this.basePath}/${id}/progress`,
      { progress },
    );
    return response.data;
  }

  /**
   * 统计项目音频文件数量
   */
  async countByProject(projectId: string): Promise<AudioStatsResponse> {
    const response = await http.get<AudioStatsResponse>(
      `${this.basePath}/stats/project/${projectId}`,
    );
    return response.data;
  }

  // ============ 波形相关方法 ============

  /**
   * 获取波形数据
   * @param audioId 音频文件ID
   * @param samplesPerPixel 每像素采样点数（默认 100）
   * @returns 波形数据
   */
  async getWaveformData(
    audioId: string,
    samplesPerPixel: number = 100,
  ): Promise<{
    audioId: string;
    data: number[];
    samplesPerPixel: number;
    duration: number;
    sampleRate: number;
    channels: number;
    fromCache: boolean;
    generatedAt: string;
  }> {
    const response = await http.get(`${this.basePath}/${audioId}/waveform`, {
      params: { samplesPerPixel },
    });
    return response.data;
  }

  /**
   * 获取波形统计信息
   * @param audioId 音频文件ID
   * @returns 波形统计信息
   */
  async getWaveformStats(audioId: string): Promise<{
    audioId: string;
    cacheStatus: {
      overview: boolean;
      detail: boolean;
      zoom: boolean;
    };
    duration: number;
    lastUpdatedAt: string;
  }> {
    const response = await http.get(`${this.basePath}/${audioId}/waveform/stats`);
    return response.data;
  }

  /**
   * 清除波形缓存
   * @param audioId 音频文件ID
   * @param samplesPerPixel 可选：特定缩放级别
   */
  async clearWaveformCache(
    audioId: string,
    samplesPerPixel?: number,
  ): Promise<void> {
    await http.delete(`${this.basePath}/${audioId}/waveform/cache`, {
      params: { samplesPerPixel },
    });
  }
}

// 导出单例实例
const audioService = new AudioService();
export default audioService;

// 导出类型
export * from '../types/audio';