import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, Session } from '../users/entities';
import { Team, TeamMember } from '../teams/entities';
import { Project } from '../projects/entities';
import { AudioFile } from '../audio/entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'audio_label'),
        entities: [User, Session, Team, TeamMember, Project, AudioFile],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: false,
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
