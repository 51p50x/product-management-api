/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, EntryCollection } from 'contentful';
import { ContentfulProduct } from '../products/products.service';

@Injectable()
export class ContentfulService {
  private readonly logger = new Logger(ContentfulService.name);
  private readonly client;

  constructor(private readonly configService: ConfigService) {
    const spaceId = this.configService.get<string>('contentful.spaceId');
    const accessToken = this.configService.get<string>(
      'contentful.accessToken',
    );

    if (!spaceId || !accessToken) {
      throw new Error(
        'Contentful credentials (spaceId and accessToken) are required',
      );
    }

    this.client = createClient({
      space: spaceId,
      accessToken: accessToken,
      environment:
        this.configService.get<string>('contentful.environment') ?? 'master',
    });
  }

  async fetchAllProducts(limit = 100): Promise<ContentfulProduct[]> {
    const contentType =
      this.configService.get<string>('contentful.type') ?? 'product';

    const allItems: ContentfulProduct[] = [];
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      this.logger.debug(`Fetching page: skip=${skip}, limit=${limit}`);

      const response: EntryCollection<any> = await this.client.getEntries({
        content_type: contentType,
        limit,
        skip,
        order: ['-sys.updatedAt'],
      });

      const pageNumber = Math.floor(skip / limit) + 1;
      const totalPages = response.total
        ? Math.ceil(response.total / limit)
        : '?';

      this.logger.log(
        `Page ${pageNumber}/${totalPages}: Received ${response.items?.length || 0} items ` +
          `(total in Contentful: ${response.total}, cumulative: ${allItems.length + (response.items?.length || 0)})`,
      );

      if (!response.items || response.items.length === 0) {
        this.logger.log('No more items to fetch, pagination complete');
        break;
      }

      const mapped: ContentfulProduct[] = response.items.map((item: any) => {
        const fields = item.fields ?? {};
        return {
          id: item.sys?.id,
          sku: fields.sku,
          name: fields.name,
          brand: fields.brand,
          model: fields.model,
          category: fields.category,
          color: fields.color,
          price: fields.price,
          currency: fields.currency,
          stock: fields.stock,
        };
      });

      allItems.push(...mapped);

      if (response.items.length < limit) {
        hasMore = false;
      } else {
        skip += limit;
      }
    }

    this.logger.log(
      `Fetched ${allItems.length} products from Contentful (total available: ${allItems.length})`,
    );
    return allItems;
  }
}
