import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Section } from './entities/section.entity';
import { Page } from '../page/entities/page.entity';
import { SectionService } from './section.service';
import { SectionController } from './section.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Section, Page])],
  controllers: [SectionController],
  providers: [SectionService],
  exports: [SectionService],
})
export class SectionModule {}
