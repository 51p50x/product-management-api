/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ContentfulService } from '../contentful/contentful.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ProductsSyncService {
  private readonly logger = new Logger(ProductsSyncService.name);
  private isSyncing = false;

  constructor(
    private readonly contentfulService: ContentfulService,
    private readonly productsService: ProductsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    await this.syncProducts();
  }

  async syncProducts() {
    if (this.isSyncing) {
      this.logger.warn('Previous sync still running, skipping this execution');
      return;
    }

    this.isSyncing = true;
    const startTime = Date.now();

    try {
      this.logger.log('Starting hourly products sync from Contentful');

      const items = await this.contentfulService.fetchAllProducts();

      if (items.length === 0) {
        this.logger.warn('No products fetched from Contentful');
        return;
      }

      await this.productsService.upsertManyFromContentful(items);

      const duration = Date.now() - startTime;
      this.logger.log(
        `Products sync completed successfully. Processed ${items.length} items in ${duration}ms`,
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Products sync failed after ${duration}ms: ${error.message}`,
        error.stack,
      );
    } finally {
      this.isSyncing = false;
    }
  }
}
