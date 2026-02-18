import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AudioFile, AudioStatus } from './entities/audio-file.entity';
import { CreateAudioFileDto } from './dto/create-audio-file.dto';
import { UpdateAudioFileDto } from './dto/update-audio-file.dto';
import { QueryAudioFileDto } from './dto/query-audio-file.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as mm from 'music-metadata';

@Injectable()
export class AudioService {
  constructor(
    @InjectRepository(AudioFile)
    private readonly audioFileRepository: Repository<AudioFile>,
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
   * 删除音频文件（软删除）
   */
  async remove(id: string): Promise<void> {
    const audioFile = await this.findOne(id);
    
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
}