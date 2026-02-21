import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feature } from './entities/feature.entity';
import { FeatureOption } from './entities/feature-option.entity';
import { CategoryFeature } from './entities/category-feature.entity';
import { Category } from '../category/entities/category.entity';
import { Product } from '../product/entities/product.entity';
import { ProductFeatureOption } from '../product/entities/product-feature-option.entity';
import { FeatureService } from './feature.service';
import { FeatureController } from './feature.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Feature, FeatureOption, CategoryFeature, Category, Product, ProductFeatureOption]),
  ],
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService],
})
export class FeatureModule {}
