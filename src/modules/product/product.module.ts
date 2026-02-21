import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductFeatureOption } from './entities/product-feature-option.entity';
import { ProductImage } from './entities/product-image.entity';
import { Media } from '../media/entities/media.entity';
import { Category } from '../category/entities/category.entity';
import { FeatureOption } from '../feature/entities/feature-option.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductFeatureOption, ProductImage, Media, Category, FeatureOption]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
