import { describe, it, expect, beforeEach, vi } from 'vitest';
import http from '../http';
import audioService from '../audio.service';
import { AudioStatus } from '../../types/audio';
import type {
  AudioFile,
  UpdateAudioFileDto,
  QueryAudioFileDto,
  AudioFileListResponse,
  UploadAudioResponse,
  AudioStatsResponse,
} from '../../types/audio';

// Mock http module
vi.mock('../http', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('AudioService', () => {
  const mockedHttp = http as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Audio File Management', () => {
    describe('uploadFile', () => {
      it('should upload an audio file successfully', async () => {
        const mockResponse: UploadAudioResponse = {
          id: 'audio-1',
          projectId: 'project-1',
          name: 'test-audio.mp3',
          storagePath: 'meetings/2024',
          fileSize: 1024000,
          fileType: 'audio/mpeg',
          status: AudioStatus.READY,
          uploadProgress: 100,
          createdAt: new Date().toISOString(),
        };

        mockedHttp.post.mockResolvedValue({ data: mockResponse });

        const mockFile = new File(['audio content'], 'test-audio.mp3', {
          type: 'audio/mpeg',
        });

        const onUploadProgress = vi.fn();

        const result = await audioService.uploadFile(
          mockFile,
          'project-1',
          'meetings/2024',
          onUploadProgress,
        );

        expect(result).toEqual(mockResponse);
        expect(mockedHttp.post).toHaveBeenCalledWith(
          '/api/audio/upload',
          expect.any(FormData),
          expect.objectContaining({
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: expect.any(Function),
          }),
        );
      });

      it('should upload a file without storage path', async () => {
        const mockResponse: UploadAudioResponse = {
          id: 'audio-1',
          projectId: 'project-1',
          name: 'test-audio.mp3',
          storagePath: '',
          fileSize: 1024000,
          fileType: 'audio/mpeg',
          status: AudioStatus.READY,
          uploadProgress: 100,
          createdAt: new Date().toISOString(),
        };

        mockedHttp.post.mockResolvedValue({ data: mockResponse });

        const mockFile = new File(['audio content'], 'test-audio.mp3', {
          type: 'audio/mpeg',
        });

        const result = await audioService.uploadFile(mockFile, 'project-1');

        expect(result).toEqual(mockResponse);
      });

      it('should handle upload errors', async () => {
        const error = new Error('Upload failed');
        mockedHttp.post.mockRejectedValue(error);

        const mockFile = new File(['audio content'], 'test-audio.mp3', {
          type: 'audio/mpeg',
        });

        await expect(audioService.uploadFile(mockFile, 'project-1')).rejects.toThrow(error);
      });
    });

    describe('getAudioFiles', () => {
      it('should get audio files with query parameters', async () => {
        const mockResponse: AudioFileListResponse = {
          data: [
            {
              id: 'audio-1',
              projectId: 'project-1',
              name: 'test-audio.mp3',
              storagePath: 'meetings/2024',
              fileSize: 1024000,
              fileType: 'audio/mpeg',
              duration: 120,
              sampleRate: 44100,
              channels: 2,
              bitRate: 320,
              metadata: {},
              status: AudioStatus.READY,
              errorMessage: null,
              createdBy: 'user-1',
              uploadProgress: 100,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              deletedAt: null,
            },
          ],
          total: 1,
          page: 1,
          pageSize: 10,
        };

        mockedHttp.get.mockResolvedValue({ data: mockResponse });

        const query: QueryAudioFileDto = {
          projectId: 'project-1',
          page: 1,
          pageSize: 10,
        };

        const result = await audioService.getAudioFiles(query);

        expect(result).toEqual(mockResponse);
        expect(mockedHttp.get).toHaveBeenCalledWith('/api/audio', {
          params: query,
        });
      });

      it('should handle errors when getting audio files', async () => {
        const error = new Error('Failed to get audio files');
        mockedHttp.get.mockRejectedValue(error);

        const query: QueryAudioFileDto = {
          projectId: 'project-1',
        };

        await expect(audioService.getAudioFiles(query)).rejects.toThrow(error);
      });
    });

    describe('getAudioFileById', () => {
      it('should get an audio file by ID', async () => {
        const mockFile: AudioFile = {
          id: 'audio-1',
          projectId: 'project-1',
          name: 'test-audio.mp3',
          storagePath: 'meetings/2024',
          fileSize: 1024000,
          fileType: 'audio/mpeg',
          duration: 120,
          sampleRate: 44100,
          channels: 2,
          bitRate: 320,
          metadata: {},
          status: AudioStatus.READY,
          errorMessage: null,
          createdBy: 'user-1',
          uploadProgress: 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        };

        mockedHttp.get.mockResolvedValue({ data: mockFile });

        const result = await audioService.getAudioFileById('audio-1');

        expect(result).toEqual(mockFile);
        expect(mockedHttp.get).toHaveBeenCalledWith('/api/audio/audio-1');
      });

      it('should handle errors when getting an audio file', async () => {
        const error = new Error('Audio file not found');
        mockedHttp.get.mockRejectedValue(error);

        await expect(audioService.getAudioFileById('audio-1')).rejects.toThrow(error);
      });
    });

    describe('updateAudioFile', () => {
      it('should update an audio file successfully', async () => {
        const mockFile: AudioFile = {
          id: 'audio-1',
          projectId: 'project-1',
          name: 'updated-audio.mp3',
          storagePath: 'meetings/2024',
          fileSize: 1024000,
          fileType: 'audio/mpeg',
          duration: 120,
          sampleRate: 44100,
          channels: 2,
          bitRate: 320,
          metadata: {},
          status: AudioStatus.READY,
          errorMessage: null,
          createdBy: 'user-1',
          uploadProgress: 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        };

        mockedHttp.patch.mockResolvedValue({ data: mockFile });

        const updateDto: UpdateAudioFileDto = {
          name: 'updated-audio.mp3',
        };

        const result = await audioService.updateAudioFile('audio-1', updateDto);

        expect(result).toEqual(mockFile);
        expect(mockedHttp.patch).toHaveBeenCalledWith('/api/audio/audio-1', updateDto);
      });

      it('should handle errors when updating an audio file', async () => {
        const error = new Error('Failed to update audio file');
        mockedHttp.patch.mockRejectedValue(error);

        const updateDto: UpdateAudioFileDto = {
          name: 'updated-audio.mp3',
        };

        await expect(audioService.updateAudioFile('audio-1', updateDto)).rejects.toThrow(error);
      });
    });

    describe('deleteAudioFile', () => {
      it('should delete an audio file successfully', async () => {
        mockedHttp.delete.mockResolvedValue({});

        await audioService.deleteAudioFile('audio-1');

        expect(mockedHttp.delete).toHaveBeenCalledWith('/api/audio/audio-1');
      });

      it('should handle errors when deleting an audio file', async () => {
        const error = new Error('Failed to delete audio file');
        mockedHttp.delete.mockRejectedValue(error);

        await expect(audioService.deleteAudioFile('audio-1')).rejects.toThrow(error);
      });
    });

    describe('updateUploadProgress', () => {
      it('should update upload progress successfully', async () => {
        const mockFile: AudioFile = {
          id: 'audio-1',
          projectId: 'project-1',
          name: 'test-audio.mp3',
          storagePath: '',
          fileSize: 1024000,
          fileType: 'audio/mpeg',
          duration: null,
          sampleRate: null,
          channels: null,
          bitRate: null,
          metadata: {},
          status: AudioStatus.UPLOADING,
          errorMessage: null,
          createdBy: 'user-1',
          uploadProgress: 50,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        };

        mockedHttp.patch.mockResolvedValue({ data: mockFile });

        const result = await audioService.updateUploadProgress('audio-1', 50);

        expect(result).toEqual(mockFile);
        expect(mockedHttp.patch).toHaveBeenCalledWith('/api/audio/audio-1/progress', {
          progress: 50,
        });
      });

      it('should handle errors when updating upload progress', async () => {
        const error = new Error('Failed to update progress');
        mockedHttp.patch.mockRejectedValue(error);

        await expect(audioService.updateUploadProgress('audio-1', 50)).rejects.toThrow(error);
      });
    });

    describe('countByProject', () => {
      it('should get audio file count for a project', async () => {
        const mockResponse: AudioStatsResponse = {
          projectId: 'project-1',
          count: 10,
        };

        mockedHttp.get.mockResolvedValue({ data: mockResponse });

        const result = await audioService.countByProject('project-1');

        expect(result).toEqual(mockResponse);
        expect(mockedHttp.get).toHaveBeenCalledWith(
          '/api/audio/stats/project/project-1',
        );
      });

      it('should handle errors when counting by project', async () => {
        const error = new Error('Failed to count by project');
        mockedHttp.get.mockRejectedValue(error);

        await expect(audioService.countByProject('project-1')).rejects.toThrow(error);
      });
    });
  });
});