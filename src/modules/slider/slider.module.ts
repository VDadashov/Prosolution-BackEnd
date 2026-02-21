import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Slider } from './entities/slider.entity';
import { Media } from '../media/entities/media.entity';
import { SliderService } from './slider.service';
import { SliderController } from './slider.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Slider, Media])],
  controllers: [SliderController],
  providers: [SliderService],
  exports: [SliderService],
})
export class SliderModule {}
