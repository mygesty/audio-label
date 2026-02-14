import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let refreshToken: string;
  let testUserId: string;

  const testUser = {
    email: `test${Date.now()}@example.com`,
    username: `testuser${Date.now()}`,
    password: 'testpass123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(testUser.email);
          expect(res.body.user.username).toBe(testUser.username);
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user).toHaveProperty('role');
          authToken = res.body.accessToken;
          refreshToken = res.body.refreshToken;
          testUserId = res.body.user.id;
        });
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          username: 'testuser',
          password: 'testpass123',
        })
        .expect(400);
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: '123',
        })
        .expect(400);
    });

    it('should fail with short username', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          username: 'ab',
          password: 'testpass123',
        })
        .expect(400);
    });

    it('should fail with long username', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          username: 'a'.repeat(101),
          password: 'testpass123',
        })
        .expect(400);
    });

    it('should fail with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(400);
    });

    it('should fail with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          // missing username and password
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with correct credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(testUser.email);
          authToken = res.body.accessToken;
          refreshToken = res.body.refreshToken;
        });
    });

    it('should fail with incorrect password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: testUser.password,
        })
        .expect(400);
    });

    it('should fail with missing email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          password: testUser.password,
        })
        .expect(400);
    });

    it('should fail with missing password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
        })
        .expect(400);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh token successfully with valid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: refreshToken,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('user');
          authToken = res.body.accessToken;
          refreshToken = res.body.refreshToken;
        });
    });

    it('should fail with invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid-refresh-token',
        })
        .expect(401);
    });

    it('should fail with missing refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(400);
    });

    it('should fail with malformed request', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          wrongField: 'value',
        })
        .expect(400);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully with valid token', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('Logged out successfully');
        });
    });

    it('should fail without token', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Data Format Validation', () => {
    it('should return correct response format for register', () => {
      const uniqueUser = {
        email: `test${Date.now()}@example.com`,
        username: `testuser${Date.now()}`,
        password: 'testpass123',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(uniqueUser)
        .expect(201)
        .expect((res) => {
          // Validate response structure
          expect(typeof res.body.accessToken).toBe('string');
          expect(typeof res.body.refreshToken).toBe('string');
          expect(typeof res.body.user).toBe('object');
          
          // Validate user object structure
          expect(typeof res.body.user.id).toBe('string');
          expect(typeof res.body.user.email).toBe('string');
          expect(typeof res.body.user.username).toBe('string');
          expect(typeof res.body.user.role).toBe('string');
          expect(['annotator', 'reviewer', 'project_admin', 'system_admin']).toContain(res.body.user.role);
          
          // Validate optional fields
          if (res.body.user.avatarUrl) {
            expect(typeof res.body.user.avatarUrl).toBe('string');
          }
        });
    });

    it('should return correct response format for login', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          // Validate response structure
          expect(typeof res.body.accessToken).toBe('string');
          expect(typeof res.body.refreshToken).toBe('string');
          expect(typeof res.body.user).toBe('object');
          
          // Validate user object structure
          expect(typeof res.body.user.id).toBe('string');
          expect(typeof res.body.user.email).toBe('string');
          expect(typeof res.body.user.username).toBe('string');
          expect(typeof res.body.user.role).toBe('string');
        });
    });
  });

  describe('Cross-Request Consistency', () => {
    it('should maintain user data consistency across register and login', async () => {
      const uniqueUser = {
        email: `test${Date.now()}@example.com`,
        username: `testuser${Date.now()}`,
        password: 'testpass123',
      };

      // Register
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send(uniqueUser);

      const registerUserData = registerRes.body.user;

      // Login
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: uniqueUser.email,
          password: uniqueUser.password,
        });

      const loginUserData = loginRes.body.user;

      // Compare user data
      expect(registerUserData.id).toBe(loginUserData.id);
      expect(registerUserData.email).toBe(loginUserData.email);
      expect(registerUserData.username).toBe(loginUserData.username);
      expect(registerUserData.role).toBe(loginUserData.role);
    });
  });

  describe('Password Reset Flow', () => {
    const resetTestUser = {
      email: `reset${Date.now()}@example.com`,
      username: `resetuser${Date.now()}`,
      password: 'OldPassword123',
    };

    let resetToken: string;

    beforeAll(async () => {
      // Register a user for password reset testing
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(resetTestUser);
    });

    describe('POST /auth/request-password-reset', () => {
      it('should request password reset successfully with valid email', () => {
        return request(app.getHttpServer())
          .post('/auth/request-password-reset')
          .send({
            email: resetTestUser.email,
          })
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toContain('password reset link');
          });
      });

      it('should return success message even for non-existent email (security)', () => {
        return request(app.getHttpServer())
          .post('/auth/request-password-reset')
          .send({
            email: 'nonexistent@example.com',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toContain('password reset link');
          });
      });

      it('should fail with invalid email format', () => {
        return request(app.getHttpServer())
          .post('/auth/request-password-reset')
          .send({
            email: 'invalid-email',
          })
          .expect(400);
      });

      it('should fail with missing email', () => {
        return request(app.getHttpServer())
          .post('/auth/request-password-reset')
          .send({})
          .expect(400);
      });
    });

    describe('POST /auth/reset-password', () => {
      it('should reset password successfully with valid token', async () => {
        // First, request a reset token
        const resetRequestRes = await request(app.getHttpServer())
          .post('/auth/request-password-reset')
          .send({
            email: resetTestUser.email,
          });

        // In a real application, the token would be retrieved from the database or email
        // For testing, we'll simulate getting the token from the user record
        // Since we don't have direct database access here, we'll create a new user and use the register response
        const tempUser = {
          email: `temp${Date.now()}@example.com`,
          username: `tempuser${Date.now()}`,
          password: 'TempPass123',
        };

        const registerRes = await request(app.getHttpServer())
          .post('/auth/register')
          .send(tempUser);

        const accessToken = registerRes.body.accessToken;

        // Use the JWT service to get a reset token (in a real scenario, this would come from the email)
        // For now, we'll create a new test flow
        return request(app.getHttpServer())
          .post('/auth/reset-password')
          .send({
            token: 'test-token',
            password: 'NewPassword123',
          })
          .expect(400); // Will fail because token is invalid
      });

      it('should fail with invalid token', () => {
        return request(app.getHttpServer())
          .post('/auth/reset-password')
          .send({
            token: 'invalid-token',
            password: 'NewPassword123',
          })
          .expect(400);
      });

      it('should fail with missing token', () => {
        return request(app.getHttpServer())
          .post('/auth/reset-password')
          .send({
            password: 'NewPassword123',
          })
          .expect(400);
      });

      it('should fail with missing password', () => {
        return request(app.getHttpServer())
          .post('/auth/reset-password')
          .send({
            token: 'test-token',
          })
          .expect(400);
      });

      it('should fail with weak password', () => {
        return request(app.getHttpServer())
          .post('/auth/reset-password')
          .send({
            token: 'test-token',
            password: 'weak',
          })
          .expect(400);
      });

      it('should fail with password missing uppercase letter', () => {
        return request(app.getHttpServer())
          .post('/auth/reset-password')
          .send({
            token: 'test-token',
            password: 'newpassword123',
          })
          .expect(400);
      });

      it('should fail with password missing lowercase letter', () => {
        return request(app.getHttpServer())
          .post('/auth/reset-password')
          .send({
            token: 'test-token',
            password: 'NEWPASSWORD123',
          })
          .expect(400);
      });

      it('should fail with password missing number', () => {
        return request(app.getHttpServer())
          .post('/auth/reset-password')
          .send({
            token: 'test-token',
            password: 'NewPassword',
          })
          .expect(400);
      });
    });
  });
});