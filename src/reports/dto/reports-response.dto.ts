import { ApiProperty } from '@nestjs/swagger';

export class DeletedProductsReportDto {
  @ApiProperty({ description: 'Total number of products' })
  totalProducts: number;

  @ApiProperty({ description: 'Number of deleted products' })
  deletedProducts: number;

  @ApiProperty({ description: 'Percentage of deleted products' })
  deletedPercentage: number;
}

export class NonDeletedProductsReportDto {
  @ApiProperty({ description: 'Total non-deleted products' })
  totalNonDeleted: number;

  @ApiProperty({ description: 'Products with price' })
  withPrice: number;

  @ApiProperty({ description: 'Products without price' })
  withoutPrice: number;

  @ApiProperty({ description: 'Percentage with price' })
  withPricePercentage: number;

  @ApiProperty({ description: 'Percentage without price' })
  withoutPricePercentage: number;

  @ApiProperty({ description: 'Date range applied (if any)' })
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
}

export class CategoryDistributionReportDto {
  @ApiProperty({ description: 'Category name' })
  category: string;

  @ApiProperty({ description: 'Number of products in category' })
  count: number;

  @ApiProperty({ description: 'Percentage of total products' })
  percentage: number;
}

export class ProductsByCategoryReportDto {
  @ApiProperty({ description: 'Total products analyzed' })
  totalProducts: number;

  @ApiProperty({
    type: [CategoryDistributionReportDto],
    description: 'Distribution by category',
  })
  distribution: CategoryDistributionReportDto[];
}
