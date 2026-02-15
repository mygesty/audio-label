import { IsNotEmpty, IsString, IsNumber, IsOptional, IsInt, Min } from 'class-validator';

export class CreateAudioFileDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  filePath: string;

  @IsNotEmpty()
  @IsNumber()
  fileSize: number;

  @IsNotEmpty()
  @IsString()
  fileType: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsNumber()
  sampleRate?: number;

  @IsOptional()
  @IsNumber()
  channels?: number;

  @IsOptional()
  @IsNumber()
  bitRate?: number;

  @IsOptional()
  folderId?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}