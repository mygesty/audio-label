import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 波形缓存表
 * 用于缓存音频文件的波形数据，避免重复解码
 */
@Entity('waveform_cache')
export class WaveformCache {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 关联的音频文件ID
   */
  @Column({ name: 'audio_id', type: 'uuid' })
  @Index()
  audioId: string;

  /**
   * 波形采样率（每像素对应的采样点数）
   * - Overview: 1000 采样点/像素
   * - Detail: 100 采样点/像素
   * - Zoom: 10 采样点/像素
   */
  @Column({ name: 'samples_per_pixel', type: 'int' })
  samplesPerPixel: number;

  /**
   * 波形数据（压缩后的数组）
   * 存储 [min, max] 对，表示每个像素点的最小和最大振幅
   */
  @Column({ name: 'waveform_data', type: 'jsonb' })
  waveformData: number[];

  /**
   * 音频时长（秒）
   */
  @Column({ name: 'duration', type: 'float', nullable: true })
  duration: number;

  /**
   * 采样率（Hz）
   */
  @Column({ name: 'sample_rate', type: 'int', nullable: true })
  sampleRate: number;

  /**
   * 通道数
   */
  @Column({ name: 'channels', type: 'int', nullable: true })
  channels: number;

  /**
   * 数据大小（字节）
   */
  @Column({ name: 'data_size', type: 'bigint', nullable: true })
  dataSize: number;

  /**
   * 是否使用 zlib 压缩
   */
  @Column({ name: 'is_compressed', type: 'boolean', default: true })
  isCompressed: boolean;

  /**
   * 最后访问时间（用于 LRU 缓存清理）
   */
  @Column({ name: 'last_accessed_at', type: 'timestamp', nullable: true })
  lastAccessedAt: Date;

  /**
   * 缓存命中次数
   */
  @Column({ name: 'hit_count', type: 'int', default: 0 })
  hitCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}