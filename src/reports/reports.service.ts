import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import {
  DeletedProductsReportDto,
  NonDeletedProductsReportDto,
  ProductsByCategoryReportDto,
  CategoryDistributionReportDto,
} from './dto/reports-response.dto';
import { DateRangeDto } from './dto/date-range.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async getDeletedProductsReport(): Promise<DeletedProductsReportDto> {
    const totalProducts = await this.productsRepository.count({
      withDeleted: true,
    });

    const deletedProducts = await this.productsRepository.count({
      where: { deletedAt: Not(IsNull()) },
      withDeleted: true,
    });

    const deletedPercentage =
      totalProducts > 0 ? (deletedProducts / totalProducts) * 100 : 0;

    return {
      totalProducts,
      deletedProducts,
      deletedPercentage: Math.round(deletedPercentage * 100) / 100,
    };
  }

  async getNonDeletedProductsReport(
    dateRangeDto: DateRangeDto,
  ): Promise<NonDeletedProductsReportDto> {
    const { startDate, endDate } = dateRangeDto;

    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .where('product.deletedAt IS NULL');

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'product.createdAt BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    } else if (startDate) {
      queryBuilder.andWhere('product.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('product.createdAt <= :endDate', { endDate });
    }

    const totalNonDeleted = await queryBuilder.getCount();

    const withPriceQuery = queryBuilder
      .clone()
      .andWhere('product.price IS NOT NULL');
    const withPrice = await withPriceQuery.getCount();

    const withoutPrice = totalNonDeleted - withPrice;

    const withPricePercentage =
      totalNonDeleted > 0 ? (withPrice / totalNonDeleted) * 100 : 0;
    const withoutPricePercentage =
      totalNonDeleted > 0 ? (withoutPrice / totalNonDeleted) * 100 : 0;

    return {
      totalNonDeleted,
      withPrice,
      withoutPrice,
      withPricePercentage: Math.round(withPricePercentage * 100) / 100,
      withoutPricePercentage: Math.round(withoutPricePercentage * 100) / 100,
      dateRange:
        startDate || endDate
          ? {
              startDate: startDate?.toISOString(),
              endDate: endDate?.toISOString(),
            }
          : undefined,
    };
  }

  async getProductsByCategoryReport(): Promise<ProductsByCategoryReportDto> {
    const products = await this.productsRepository.find({
      where: { deletedAt: IsNull() },
      select: ['category'],
    });

    const totalProducts = products.length;

    const categoryCount = products.reduce(
      (acc, product) => {
        const category = product.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const distribution: CategoryDistributionReportDto[] = Object.entries(
      categoryCount,
    )
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / totalProducts) * 10000) / 100,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalProducts,
      distribution,
    };
  }
}
