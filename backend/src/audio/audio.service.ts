import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AudioFile, AudioStatus } from './entities/audio-file.entity';
import { WaveformCache } from './entities/waveform-cache.entity';
import { CreateAudioFileDto } from './dto/create-audio-file.dto';
import { UpdateAudioFileDto } from './dto/update-audio-file.dto';
import { QueryAudioFileDto } from './dto/query-audio-file.dto';
import {
  GetWaveformDto,
  WaveformDataDto,
  WaveformStatsDto,
  WaveformZoomLevel,
} from './dto/waveform.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as mm from 'music-metadata';
import * as pako from 'pako';

@Injectable()
export class AudioService {
  private readonly logger = new Logger(AudioService.name);

  constructor(
    @InjectRepository(AudioFile)
    private readonly audioFileRepository: Repository<AudioFile>,
    @InjectRepository(WaveformCache)
    private readonly waveformCacheRepository: Repository<WaveformCache>,
  ) {}

  /**
   * 创建音频文件记录
   */
  async create(
    createAudioFileDto: CreateAudioFileDto,
    projectId: string,
    userId: string,
  ): Promise<AudioFile> {
    const audioFile = this.audioFileRepository.create({
      ...createAudioFileDto,
      projectId,
      createdBy: userId,
      status: AudioStatus.UPLOADING,
      uploadProgress: 0,
    });

    return await this.audioFileRepository.save(audioFile);
  }

  /**
   * 获取音频文件列表
   */
  async findAll(
    query: QueryAudioFileDto,
  ): Promise<{ data: AudioFile[]; total: number; page: number; pageSize: number }> {
    const { projectId, name, status, fileType, page = 1, pageSize = 10 } = query;

    const queryBuilder = this.audioFileRepository
      .createQueryBuilder('audioFile')
      .leftJoinAndSelect('audioFile.project', 'project')
      .leftJoinAndSelect('audioFile.creator', 'creator')
      .select([
        'audioFile.id',
        'audioFile.projectId',
        'audioFile.name',
        'audioFile.storagePath',
        'audioFile.fileSize',
        'audioFile.fileType',
        'audioFile.duration',
        'audioFile.sampleRate',
        'audioFile.channels',
        'audioFile.status',
        'audioFile.uploadProgress',
        'audioFile.createdAt',
        'audioFile.updatedAt',
        'project.id',
        'project.name',
        'creator.id',
        'creator.username',
      ]);

    // 过滤条件
    if (projectId) {
      queryBuilder.andWhere('audioFile.projectId = :projectId', { projectId });
    }

    if (name) {
      queryBuilder.andWhere('audioFile.name LIKE :name', { name: `%${name}%` });
    }

    if (status) {
      queryBuilder.andWhere('audioFile.status = :status', { status });
    }

    if (fileType) {
      queryBuilder.andWhere('audioFile.fileType = :fileType', { fileType });
    }

    // 软删除过滤
    queryBuilder.andWhere('audioFile.deletedAt IS NULL');

    // 分页
    queryBuilder.skip((page - 1) * pageSize).take(pageSize);

    // 排序
    queryBuilder.orderBy('audioFile.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取音频文件详情
   */
  async findOne(id: string): Promise<AudioFile> {
    const audioFile = await this.audioFileRepository.findOne({
      where: { id },
      relations: ['project', 'creator'],
    });

    if (!audioFile) {
      throw new NotFoundException('音频文件不存在');
    }

    return audioFile;
  }

  /**
   * 更新音频文件
   */
  async update(id: string, updateAudioFileDto: UpdateAudioFileDto): Promise<AudioFile> {
    const audioFile = await this.findOne(id);

    Object.assign(audioFile, updateAudioFileDto);

    return await this.audioFileRepository.save(audioFile);
  }

  /**
   * 删除音频文件（软删除 + 删除物理文件）
   */
  async remove(id: string): Promise<void> {
    const audioFile = await this.findOne(id);

    // 删除物理文件
    const uploadDir = path.join(process.cwd(), 'uploads', 'audio');
    const filePath = path.join(uploadDir, audioFile.storageKey || audioFile.id);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`已删除物理文件: ${filePath}`);
      } else {
        console.warn(`物理文件不存在: ${filePath}`);
      }
    } catch (error) {
      console.error('删除物理文件失败:', error);
      // 即使删除文件失败，也继续删除数据库记录
    }

    // 软删除数据库记录
    await this.audioFileRepository.softRemove(audioFile);
  }

  /**
   * 更新上传进度
   */
  async updateUploadProgress(id: string, progress: number): Promise<AudioFile> {
    const audioFile = await this.findOne(id);

    audioFile.uploadProgress = Math.min(100, Math.max(0, progress));

    if (progress >= 100) {
      audioFile.status = AudioStatus.READY;
    }

    return await this.audioFileRepository.save(audioFile);
  }

  /**
   * 更新音频文件状态
   */
  async updateStatus(
    id: string,
    status: AudioStatus,
    errorMessage?: string,
  ): Promise<AudioFile> {
    const audioFile = await this.findOne(id);

    audioFile.status = status;
    if (errorMessage) {
      audioFile.errorMessage = errorMessage;
    }

    return await this.audioFileRepository.save(audioFile);
  }

  /**
   * 统计项目音频文件数量
   */
  async countByProject(projectId: string): Promise<number> {
    return await this.audioFileRepository.count({
      where: { projectId },
    });
  }

  /**
   * 获取音频文件路径
   */
  async getAudioFilePath(id: string): Promise<{ filePath: string; audioFile: AudioFile }> {
    const audioFile = await this.audioFileRepository.findOne({
      where: { id },
    });

    if (!audioFile) {
      throw new NotFoundException('音频文件不存在');
    }

    // 检查文件状态
    if (audioFile.status !== AudioStatus.READY) {
      throw new BadRequestException('音频文件未就绪');
    }

    // 构建文件路径（当前实现是基于本地文件系统）
    const uploadDir = path.join(process.cwd(), 'uploads', 'audio');
    const filePath = path.join(uploadDir, audioFile.storageKey || audioFile.id);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('音频文件不存在于服务器');
    }

    return { filePath, audioFile };
  }

  /**
   * 更新音频文件时长
   */
  async updateAudioDuration(id: string): Promise<AudioFile> {
    const { filePath, audioFile } = await this.getAudioFilePath(id);

    // 获取音频时长（使用 music-metadata 库）
    let duration = 0;
    try {
      const metadata = await mm.parseFile(filePath);
      duration = metadata.format.duration || 0;
      // 四舍五入到两位小数
      duration = Math.round(duration * 100) / 100;
      console.log(`音频文件 ${id} 时长:`, duration, '秒');
    } catch (error) {
      console.error('获取音频时长失败:', error);
      throw new InternalServerErrorException('无法解析音频文件');
    }

    // 更新数据库
    audioFile.duration = duration > 0 ? duration : null;
    return await this.audioFileRepository.save(audioFile);
  }

  // ============ 波形相关方法 ============

  /**
   * 解码音频文件
   * @param filePath 音频文件路径
   * @returns 解码后的音频数据
   */
  private async decodeAudio(filePath: string): Promise<{
    channelData: Float32Array[];
    sampleRate: number;
  }> {
    try {
      // 动态导入 audio-decode
      const audioDecodeModule = await import('audio-decode');
      const audioDecode = audioDecodeModule.default;

      // 读取文件内容
      const buffer = fs.readFileSync(filePath);
      const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

      // 使用 audio-decode 解码
      const audioBuffer = await audioDecode(arrayBuffer);

      // 提取所有通道数据
      const channelData: Float32Array[] = [];
      for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        channelData.push(audioBuffer.getChannelData(i));
      }

      return {
        channelData,
        sampleRate: audioBuffer.sampleRate,
      };
    } catch (error) {
      this.logger.error('音频解码失败:', error);
      throw new InternalServerErrorException('音频解码失败');
    }
  }

  /**
   * 生成波形数据
   * @param channelData 通道数据
   * @param samplesPerPixel 每像素采样点数
   * @returns 波形数据（[min, max] 对数组）
   */
  private generateWaveformData(
    channelData: Float32Array[],
    samplesPerPixel: number,
  ): number[] {
    // 如果有多个通道，先混音为单声道
    const samples = channelData[0];
    const totalSamples = samples.length;

    // 计算波形数据点数
    const dataPoints = Math.ceil(totalSamples / samplesPerPixel);
    const waveformData: number[] = [];

    for (let i = 0; i < dataPoints; i++) {
      const startSample = i * samplesPerPixel;
      const endSample = Math.min(startSample + samplesPerPixel, totalSamples);

      let min = 1.0;
      let max = -1.0;

      // 找出该像素范围内的最小和最大振幅
      for (let j = startSample; j < endSample; j++) {
        const sample = samples[j];
        if (sample < min) min = sample;
        if (sample > max) max = sample;
      }

      // 如果没有采样点（不应该发生），设置为 0
      if (min > max) {
        min = 0;
        max = 0;
      }

      waveformData.push(min, max);
    }

    return waveformData;
  }

  /**
   * 压缩波形数据
   * @param waveformData 波形数据
   * @returns 压缩后的数据
   */
  private compressWaveformData(waveformData: number[]): string {
    try {
      const jsonString = JSON.stringify(waveformData);
      const compressed = pako.deflate(jsonString, { to: 'string' });
      return compressed;
    } catch (error) {
      this.logger.error('波形数据压缩失败:', error);
      throw new InternalServerErrorException('波形数据压缩失败');
    }
  }

  /**
   * 解压缩波形数据
   * @param compressed 压缩后的数据
   * @returns 解压后的波形数据
   */
  private decompressWaveformData(compressed: string): number[] {
    try {
      const decompressed = pako.inflate(compressed, { to: 'string' });
      return JSON.parse(decompressed);
    } catch (error) {
      this.logger.error('波形数据解压失败:', error);
      throw new InternalServerErrorException('波形数据解压失败');
    }
  }

  /**
   * 获取波形数据
   * @param audioId 音频文件ID
   * @param samplesPerPixel 每像素采样点数
   * @returns 波形数据响应
   */
  async getWaveformData(
    audioId: string,
    samplesPerPixel: number = WaveformZoomLevel.DETAIL,
  ): Promise<WaveformDataDto> {
    const audioFile = await this.findOne(audioId);

    // 检查缓存
    let waveformCache = await this.waveformCacheRepository.findOne({
      where: {
        audioId,
        samplesPerPixel,
      },
    });

    let fromCache = false;

    if (waveformCache) {
      // 从缓存读取
      fromCache = true;
      this.logger.log(`从缓存读取波形数据: ${audioId}`);

      // 更新缓存统计
      waveformCache.lastAccessedAt = new Date();
      waveformCache.hitCount += 1;
      await this.waveformCacheRepository.save(waveformCache);

      // 解压数据
      const waveformData = waveformCache.isCompressed
        ? this.decompressWaveformData(waveformCache.waveformData as any)
        : waveformCache.waveformData as any;

      return {
        audioId,
        data: waveformData,
        samplesPerPixel,
        duration: waveformCache.duration,
        sampleRate: waveformCache.sampleRate,
        channels: waveformCache.channels,
        fromCache,
        generatedAt: waveformCache.updatedAt.toISOString(),
      };
    }

    // 缓存未命中，生成波形数据
    this.logger.log(`生成波形数据: ${audioId}`);

    // 获取音频文件路径
    const { filePath } = await this.getAudioFilePath(audioId);

    // 解码音频
    const { channelData, sampleRate } = await this.decodeAudio(filePath);

    // 生成波形数据
    const waveformData = this.generateWaveformData(channelData, samplesPerPixel);

    // 压缩波形数据
    const compressedData = this.compressWaveformData(waveformData);

    // 保存到缓存
    waveformCache = this.waveformCacheRepository.create({
      audioId,
      samplesPerPixel,
      waveformData: compressedData as any,
      duration: audioFile.duration,
      sampleRate,
      channels: channelData.length,
      dataSize: Buffer.byteLength(compressedData),
      isCompressed: true,
      lastAccessedAt: new Date(),
      hitCount: 1,
    });

    await this.waveformCacheRepository.save(waveformCache);

    return {
      audioId,
      data: waveformData,
      samplesPerPixel,
      duration: audioFile.duration,
      sampleRate,
      channels: channelData.length,
      fromCache: false,
      generatedAt: waveformCache.createdAt.toISOString(),
    };
  }

  /**
   * 获取波形统计信息
   * @param audioId 音频文件ID
   * @returns 波形统计信息
   */
  async getWaveformStats(audioId: string): Promise<WaveformStatsDto> {
    const audioFile = await this.findOne(audioId);

    // 查询所有缩放级别的缓存
    const caches = await this.waveformCacheRepository.find({
      where: { audioId },
      order: { samplesPerPixel: 'ASC' },
    });

    const cacheStatus = {
      overview: false,
      detail: false,
      zoom: false,
    };

    caches.forEach((cache) => {
      if (cache.samplesPerPixel === WaveformZoomLevel.OVERVIEW) {
        cacheStatus.overview = true;
      } else if (cache.samplesPerPixel === WaveformZoomLevel.DETAIL) {
        cacheStatus.detail = true;
      } else if (cache.samplesPerPixel === WaveformZoomLevel.ZOOM) {
        cacheStatus.zoom = true;
      }
    });

    // 获取最后更新时间
    const lastUpdatedAt = caches.length > 0
      ? Math.max(...caches.map((c) => c.updatedAt.getTime()))
      : 0;

    return {
      audioId,
      cacheStatus,
      duration: audioFile.duration,
      lastUpdatedAt: new Date(lastUpdatedAt).toISOString(),
    };
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
    const where: any = { audioId };
    if (samplesPerPixel !== undefined) {
      where.samplesPerPixel = samplesPerPixel;
    }

    const result = await this.waveformCacheRepository.delete(where);
    this.logger.log(`清除波形缓存: ${audioId}, 删除了 ${result.affected} 条记录`);
  }

  /**
   * 批量清理过期缓存（LRU）
   * @param days 超过多少天未访问
   */
  async cleanupOldCache(days: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.waveformCacheRepository
      .createQueryBuilder()
      .delete()
      .where('last_accessed_at < :cutoffDate', { cutoffDate })
      .execute();

    this.logger.log(`清理过期缓存: 删除了 ${result.affected} 条记录`);
    return result.affected || 0;
  }
}