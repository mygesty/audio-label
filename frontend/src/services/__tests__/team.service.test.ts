import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import teamService from '../team.service';
import http from '../http';
import { Team, TeamMember, TeamMemberRole } from '../../types/team';

// Mock http module
vi.mock('../http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('TeamService', () => {
  const mockTeamId = 'team-123';
  const mockUserId = 'user-123';

  const mockTeam: Team = {
    id: mockTeamId,
    name: 'Test Team',
    description: 'Test Description',
    ownerId: mockUserId,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockTeamMember: TeamMember = {
    id: 'member-123',
    teamId: mockTeamId,
    userId: mockUserId,
    role: TeamMemberRole.ADMIN,
    joinedAt: '2024-01-01T00:00:00Z',
    user: {
      id: mockUserId,
      email: 'test@example.com',
      username: 'testuser',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createTeam', () => {
    it('should create a team successfully', async () => {
      const createData = {
        name: 'New Team',
        description: 'New Description',
      };

      (http.post as any).mockResolvedValue({ data: mockTeam });

      const result = await teamService.createTeam(createData);

      expect(http.post).toHaveBeenCalledWith('/teams', createData);
      expect(result).toEqual(mockTeam);
    });

    it('should handle errors when creating team', async () => {
      const createData = {
        name: 'New Team',
      };

      const error = new Error('Failed to create team');
      (http.post as any).mockRejectedValue(error);

      await expect(teamService.createTeam(createData)).rejects.toThrow(error);
    });
  });

  describe('getTeams', () => {
    it('should get teams list without params', async () => {
      const mockTeams = [mockTeam];
      (http.get as any).mockResolvedValue({ data: mockTeams });

      const result = await teamService.getTeams();

      expect(http.get).toHaveBeenCalledWith('/teams', { params: undefined });
      expect(result).toEqual(mockTeams);
    });

    it('should get teams list with search params', async () => {
      const params = { search: 'test' };
      const mockTeams = [mockTeam];
      (http.get as any).mockResolvedValue({ data: mockTeams });

      const result = await teamService.getTeams(params);

      expect(http.get).toHaveBeenCalledWith('/teams', { params });
      expect(result).toEqual(mockTeams);
    });
  });

  describe('getTeamDetail', () => {
    it('should get team detail successfully', async () => {
      (http.get as any).mockResolvedValue({ data: mockTeam });

      const result = await teamService.getTeamDetail(mockTeamId);

      expect(http.get).toHaveBeenCalledWith(`/teams/${mockTeamId}`);
      expect(result).toEqual(mockTeam);
    });
  });

  describe('updateTeam', () => {
    it('should update team successfully', async () => {
      const updateData = {
        name: 'Updated Team',
        description: 'Updated Description',
      };

      const updatedTeam = { ...mockTeam, ...updateData };
      (http.patch as any).mockResolvedValue({ data: updatedTeam });

      const result = await teamService.updateTeam(mockTeamId, updateData);

      expect(http.patch).toHaveBeenCalledWith(`/teams/${mockTeamId}`, updateData);
      expect(result).toEqual(updatedTeam);
    });
  });

  describe('deleteTeam', () => {
    it('should delete team successfully', async () => {
      (http.delete as any).mockResolvedValue({});

      await teamService.deleteTeam(mockTeamId);

      expect(http.delete).toHaveBeenCalledWith(`/teams/${mockTeamId}`);
    });
  });

  describe('inviteMembers', () => {
    it('should invite members successfully', async () => {
      const inviteData = {
        emails: ['user1@example.com', 'user2@example.com'],
        role: TeamMemberRole.MEMBER,
      };

      const mockMembers = [mockTeamMember, { ...mockTeamMember, id: 'member-456' }];
      (http.post as any).mockResolvedValue({ data: mockMembers });

      const result = await teamService.inviteMembers(mockTeamId, inviteData);

      expect(http.post).toHaveBeenCalledWith(`/teams/${mockTeamId}/invite`, inviteData);
      expect(result).toEqual(mockMembers);
    });
  });

  describe('getTeamMembers', () => {
    it('should get team members successfully', async () => {
      const mockMembers = [mockTeamMember];
      (http.get as any).mockResolvedValue({ data: mockMembers });

      const result = await teamService.getTeamMembers(mockTeamId);

      expect(http.get).toHaveBeenCalledWith(`/teams/${mockTeamId}/members`);
      expect(result).toEqual(mockMembers);
    });
  });

  describe('removeMember', () => {
    it('should remove member successfully', async () => {
      (http.delete as any).mockResolvedValue({});

      await teamService.removeMember(mockTeamId, mockUserId);

      expect(http.delete).toHaveBeenCalledWith(`/teams/${mockTeamId}/members/${mockUserId}`);
    });
  });

  describe('updateMemberRole', () => {
    it('should update member role successfully', async () => {
      const updateData = { role: TeamMemberRole.ADMIN };
      const updatedMember = { ...mockTeamMember, role: TeamMemberRole.ADMIN };
      (http.patch as any).mockResolvedValue({ data: updatedMember });

      const result = await teamService.updateMemberRole(mockTeamId, mockUserId, updateData);

      expect(http.patch).toHaveBeenCalledWith(
        `/teams/${mockTeamId}/members/${mockUserId}/role`,
        updateData
      );
      expect(result).toEqual(updatedMember);
    });
  });

  describe('batchInviteMembers', () => {
    it('should batch invite members successfully', async () => {
      const emails = ['user1@example.com', 'user2@example.com'];
      const mockMembers = [mockTeamMember, { ...mockTeamMember, id: 'member-456' }];
      (http.post as any).mockResolvedValue({ data: mockMembers });

      const result = await teamService.batchInviteMembers(mockTeamId, emails);

      expect(http.post).toHaveBeenCalledWith(`/teams/${mockTeamId}/invite`, {
        emails,
        role: TeamMemberRole.MEMBER,
      });
      expect(result).toEqual(mockMembers);
    });

    it('should batch invite members with custom role', async () => {
      const emails = ['user1@example.com'];
      const mockMembers = [mockTeamMember];
      (http.post as any).mockResolvedValue({ data: mockMembers });

      const result = await teamService.batchInviteMembers(mockTeamId, emails, TeamMemberRole.ADMIN);

      expect(http.post).toHaveBeenCalledWith(`/teams/${mockTeamId}/invite`, {
        emails,
        role: TeamMemberRole.ADMIN,
      });
      expect(result).toEqual(mockMembers);
    });
  });

  describe('batchRemoveMembers', () => {
    it('should batch remove members successfully', async () => {
      const userIds = ['user-123', 'user-456'];
      (http.delete as any).mockResolvedValue({});

      await teamService.batchRemoveMembers(mockTeamId, userIds);

      expect(http.delete).toHaveBeenCalledTimes(2);
      expect(http.delete).toHaveBeenCalledWith(`/teams/${mockTeamId}/members/user-123`);
      expect(http.delete).toHaveBeenCalledWith(`/teams/${mockTeamId}/members/user-456`);
    });
  });

  describe('batchUpdateMemberRoles', () => {
    it('should batch update member roles successfully', async () => {
      const updates = [
        { userId: 'user-123', role: TeamMemberRole.ADMIN },
        { userId: 'user-456', role: TeamMemberRole.MEMBER },
      ];

      const mockMembers = [
        { ...mockTeamMember, role: TeamMemberRole.ADMIN },
        { ...mockTeamMember, id: 'member-456', userId: 'user-456', role: TeamMemberRole.MEMBER },
      ];

      (http.patch as any)
        .mockResolvedValueOnce({ data: mockMembers[0] })
        .mockResolvedValueOnce({ data: mockMembers[1] });

      const result = await teamService.batchUpdateMemberRoles(mockTeamId, updates);

      expect(http.patch).toHaveBeenCalledTimes(2);
      expect(http.patch).toHaveBeenCalledWith(
        `/teams/${mockTeamId}/members/user-123/role`,
        { role: TeamMemberRole.ADMIN }
      );
      expect(http.patch).toHaveBeenCalledWith(
        `/teams/${mockTeamId}/members/user-456/role`,
        { role: TeamMemberRole.MEMBER }
      );
      expect(result).toEqual(mockMembers);
    });
  });

  describe('Data Format Validation', () => {
    it('should maintain correct data format in team creation', async () => {
      const createData = {
        name: 'Test Team',
        description: 'Test Description',
      };

      const teamResponse = {
        id: 'team-123',
        name: 'Test Team',
        description: 'Test Description',
        ownerId: 'user-123',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (http.post as any).mockResolvedValue({ data: teamResponse });

      const result = await teamService.createTeam(createData);

      // Validate response structure
      expect(typeof result.id).toBe('string');
      expect(typeof result.name).toBe('string');
      expect(typeof result.ownerId).toBe('string');
      expect(typeof result.createdAt).toBe('string');
      expect(typeof result.updatedAt).toBe('string');
      expect(result.name).toBe(createData.name);
      expect(result.description).toBe(createData.description);
    });

    it('should maintain correct data format in team members', async () => {
      const mockMembers = [mockTeamMember];
      (http.get as any).mockResolvedValue({ data: mockMembers });

      const result = await teamService.getTeamMembers(mockTeamId);

      // Validate response structure
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      const member = result[0];
      expect(typeof member.id).toBe('string');
      expect(typeof member.teamId).toBe('string');
      expect(typeof member.userId).toBe('string');
      expect(typeof member.role).toBe('string');
      expect(typeof member.joinedAt).toBe('string');

      // Validate role enum
      expect(['member', 'admin']).toContain(member.role);

      // Validate user object
      if (member.user) {
        expect(typeof member.user.id).toBe('string');
        expect(typeof member.user.email).toBe('string');
        expect(typeof member.user.username).toBe('string');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      (http.get as any).mockRejectedValue(new Error('Network Error'));

      await expect(teamService.getTeams()).rejects.toThrow('Network Error');
    });

    it('should handle HTTP errors with response data', async () => {
      const error = {
        response: {
          data: {
            message: 'Team not found',
          },
        },
      };

      (http.get as any).mockRejectedValue(error);

      try {
        await teamService.getTeamDetail(mockTeamId);
      } catch (err: any) {
        expect(err.response.data.message).toBe('Team not found');
      }
    });
  });
});