import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
import { AudioFolder } from './audio-folder.entity';

export enum AudioStatus {
  UPLOADING = 'uploading',
  READY = 'ready',
  PROCESSING = 'processing',
  ERROR = 'error',
}

@Entity('audio_files')
export class AudioFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'folder_id', nullable: true })
  folderId: string | null;

  @ManyToOne(() => AudioFolder, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'folder_id' })
  folder: AudioFolder | null;

  @Column({ length: 500 })
  name: string;

  @Column({ name: 'file_path', length: 500 })
  filePath: string;

  @Column({ name: 'file_size' })
  fileSize: number;

  @Column({ name: 'file_type', length: 50 })
  fileType: string;

  @Column({ name: 'duration', nullable: true })
  duration: number | null;

  @Column({ name: 'sample_rate', nullable: true })
  sampleRate: number | null;

  @Column({ name: 'channels', nullable: true })
  channels: number | null;

  @Column({ name: 'bit_rate', nullable: true })
  bitRate: number | null;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({
    type: 'enum',
    enum: AudioStatus,
    default: AudioStatus.UPLOADING,
  })
  status: AudioStatus;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'upload_progress', default: 0 })
  uploadProgress: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}