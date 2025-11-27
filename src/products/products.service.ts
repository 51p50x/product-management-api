/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Product } from './entities/product.entity';
import { QueryProductsDto } from './dto/query-products.dto';
import { PaginatedProductsDto } from './dto/paginated-products.dto';

export interface ContentfulProduct {
  id: string;
  sku?: number;
  name?: string;
  brand?: string;
  model?: string;
  category?: string;
  color?: string;
  price?: number;
  currency?: string;
  stock?: number;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async upsertManyFromContentful(items: ContentfulProduct[]): Promise<void> {
    if (items.length === 0) return;

    const BATCH_SIZE = 500;
    const totalBatches = Math.ceil(items.length / BATCH_SIZE);

    this.logger.log(
      `Starting insert of ${items.length} products in ${totalBatches} batches`,
    );

    let insertedCount = 0;
    let skippedCount = 0;

    await this.productsRepository.manager.transaction(
      async (transactionalEntityManager) => {
        for (let i = 0; i < items.length; i += BATCH_SIZE) {
          const batch = items.slice(i, i + BATCH_SIZE);
          const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

          this.logger.debug(
            `Processing batch ${batchNumber}/${totalBatches} (${batch.length} items)`,
          );

          const productsToInsert = batch.map((item) => ({
            contentfulId: item.id,
            name: item.name,
            sku: item.sku,
            brand: item.brand,
            model: item.model,
            category: item.category,
            color: item.color,
            price: item.price,
            currency: item.currency,
            stock: item.stock,
          }));

          const result = await transactionalEntityManager
            .createQueryBuilder()
            .insert()
            .into(Product)
            .values(productsToInsert)
            .orIgnore()
            .execute();

          const batchInserted =
            result.raw?.length || result.identifiers?.length || 0;
          insertedCount += batchInserted;
          skippedCount += batch.length - batchInserted;
        }
      },
    );

    this.logger.log(
      `Insert complete. Inserted: ${insertedCount}, Skipped (already exist): ${skippedCount}`,
    );
  }

  async findAll(queryDto: QueryProductsDto): Promise<PaginatedProductsDto> {
    const {
      page = 1,
      limit = 5,
      name,
      category,
      brand,
      color,
      minPrice,
      maxPrice,
    } = queryDto;

    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .where('product.deletedAt IS NULL');

    if (name) {
      queryBuilder.andWhere('product.name ILIKE :name', { name: `%${name}%` });
    }

    if (category) {
      queryBuilder.andWhere('product.category ILIKE :category', {
        category: `%${category}%`,
      });
    }

    if (brand) {
      queryBuilder.andWhere('product.brand ILIKE :brand', {
        brand: `%${brand}%`,
      });
    }

    if (color) {
      queryBuilder.andWhere('product.color ILIKE :color', {
        color: `%${color}%`,
      });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit).orderBy('product.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      page,
      limit,
      total,
      totalPages,
      hasPrevious: page > 1,
      hasNext: page < totalPages,
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async softDelete(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.softDelete(id);
    this.logger.log(`Product ${id} soft deleted`);
  }
}
