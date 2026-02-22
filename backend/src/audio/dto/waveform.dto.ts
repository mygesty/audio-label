import { IsEnum, IsInt, IsOptional, Min, Max } from 'class-validator';

/**
 * 波形缩放级别
 */
export enum WaveformZoomLevel {
  /**
   * 概览级 - 每像素 1000 采样点
   */
  OVERVIEW = 1000,

  /**
   * 详细级 - 每像素 100 采样点
   */
  DETAIL = 100,

  /**
   * 缩放级 - 每像素 10 采样点
   */
  ZOOM = 10,
}

/**
 * 获取波形数据 DTO
 */
export class GetWaveformDto {
  /**
   * 缩放级别（每像素采样点数）
   * - 1000: 概览级
   * - 100: 详细级
   * - 10: 缩放级
   */
  @IsEnum(WaveformZoomLevel)
  @IsOptional()
  samplesPerPixel?: WaveformZoomLevel;

  /**
   * 起始时间（秒）
   */
  @IsOptional()
  startTime?: number;

  /**
   * 结束时间（秒）
   */
  @IsOptional()
  endTime?: number;

  /**
   * 波形宽度（像素）
   */
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(10000)
  width?: number;
}

/**
 * 波形数据响应 DTO
 */
export interface WaveformDataDto {
  /**
   * 音频ID
   */
  audioId: string;

  /**
   * 波形数据（[min, max] 对数组）
   */
  data: number[];

  /**
   * 采样率（每像素采样点数）
   */
  samplesPerPixel: number;

  /**
   * 音频时长（秒）
   */
  duration: number;

  /**
   * 采样率（Hz）
   */
  sampleRate: number;

  /**
   * 通道数
   */
  channels: number;

  /**
   * 是否来自缓存
   */
  fromCache: boolean;

  /**
   * 数据生成时间
   */
  generatedAt: string;
}

/**
 * 波形统计信息 DTO
 */
export interface WaveformStatsDto {
  /**
   * 音频ID
   */
  audioId: string;

  /**
   * 缓存状态
   */
  cacheStatus: {
    overview: boolean;
    detail: boolean;
    zoom: boolean;
  };

  /**
   * 音频时长（秒）
   */
  duration: number;

  /**
   * 最后更新时间
   */
  lastUpdatedAt: string;
}