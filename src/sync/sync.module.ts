import { Module } from '@nestjs/common';
import { ContentfulModule } from '../contentful/contentful.module';
import { ProductsModule } from '../products/products.module';
import { ProductsSyncService } from './products-sync.service';

@Module({
  imports: [ContentfulModule, ProductsModule],
  providers: [ProductsSyncService],
})
export class SyncModule {}
