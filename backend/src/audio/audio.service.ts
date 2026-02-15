import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AudioFile, AudioStatus } from './entities/audio-file.entity';
import { AudioFolder } from './entities/audio-folder.entity';
import { CreateAudioFileDto } from './dto/create-audio-file.dto';
import { UpdateAudioFileDto } from './dto/update-audio-file.dto';
import { CreateAudioFolderDto } from './dto/create-audio-folder.dto';
import { UpdateAudioFolderDto } from './dto/update-audio-folder.dto';
import { QueryAudioFileDto } from './dto/query-audio-file.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AudioService {
  constructor(
    @InjectRepository(AudioFile)
    private readonly audioFileRepository: Repository<AudioFile>,
    @InjectRepository(AudioFolder)
    private readonly audioFolderRepository: Repository<AudioFolder>,
  ) {}

  /**
   * 创建音频文件夹
   */
  async createFolder(
    createAudioFolderDto: CreateAudioFolderDto,
    projectId: string,
    userId: string,
  ): Promise<AudioFolder> {
    // 验证项目是否存在
    // 这里应该检查项目是否存在，暂时跳过

    // 如果有父文件夹，验证父文件夹是否存在
    if (createAudioFolderDto.parentId) {
      const parentFolder = await this.audioFolderRepository.findOne({
        where: { id: createAudioFolderDto.parentId },
      });
      if (!parentFolder) {
        throw new NotFoundException('父文件夹不存在');
      }
    }

    const folder = this.audioFolderRepository.create({
      ...createAudioFolderDto,
      projectId,
      createdBy: userId,
    });

    return await this.audioFolderRepository.save(folder);
  }

  /**
   * 获取文件夹列表
   */
  async findFolders(projectId: string): Promise<AudioFolder[]> {
    return await this.audioFolderRepository.find({
      where: { projectId, deletedAt: null },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 获取文件夹详情
   */
  async findFolderById(id: string): Promise<AudioFolder> {
    const folder = await this.audioFolderRepository.findOne({
      where: { id },
    });

    if (!folder) {
      throw new NotFoundException('文件夹不存在');
    }

    return folder;
  }

  /**
   * 更新文件夹
   */
  async updateFolder(
    id: string,
    updateAudioFolderDto: UpdateAudioFolderDto,
  ): Promise<AudioFolder> {
    const folder = await this.findFolderById(id);

    Object.assign(folder, updateAudioFolderDto);

    return await this.audioFolderRepository.save(folder);
  }

  /**
   * 删除文件夹
   */
  async removeFolder(id: string): Promise<void> {
    const folder = await this.findFolderById(id);

    // 检查文件夹内是否有音频文件
    const fileCount = await this.audioFileRepository.count({
      where: { folderId: id },
    });

    if (fileCount > 0) {
      throw new BadRequestException('文件夹内还有音频文件，无法删除');
    }

    await this.audioFolderRepository.remove(folder);
  }

  /**
   * 创建音频文件记录
   */
  async create(
    createAudioFileDto: CreateAudioFileDto,
    projectId: string,
    userId: string,
  ): Promise<AudioFile> {
    // 验证文件夹是否存在（如果提供了 folderId）
    if (createAudioFileDto.folderId) {
      const folder = await this.audioFolderRepository.findOne({
        where: { id: createAudioFileDto.folderId },
      });
      if (!folder) {
        throw new NotFoundException('文件夹不存在');
      }
    }

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
    const { projectId, folderId, name, status, fileType, page = 1, pageSize = 10 } = query;

    const queryBuilder = this.audioFileRepository
      .createQueryBuilder('audioFile')
      .leftJoinAndSelect('audioFile.project', 'project')
      .leftJoinAndSelect('audioFile.folder', 'folder')
      .leftJoinAndSelect('audioFile.creator', 'creator')
      .select([
        'audioFile.id',
        'audioFile.projectId',
        'audioFile.folderId',
        'audioFile.name',
        'audioFile.filePath',
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
        'folder.id',
        'folder.name',
        'creator.id',
        'creator.username',
      ]);

    // 过滤条件
    if (projectId) {
      queryBuilder.andWhere('audioFile.projectId = :projectId', { projectId });
    }

    if (folderId) {
      queryBuilder.andWhere('audioFile.folderId = :folderId', { folderId });
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
      relations: ['project', 'folder', 'creator'],
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
   * 统计文件夹音频文件数量
   */
  async countByFolder(folderId: string): Promise<number> {
    return await this.audioFileRepository.count({
      where: { folderId },
    });
  }
}