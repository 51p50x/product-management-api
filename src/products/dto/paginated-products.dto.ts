import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../entities/product.entity';

export class PaginatedProductsDto {
  @ApiProperty({ type: [Product], description: 'Array of products' })
  data: Product[];

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ description: 'Has previous page' })
  hasPrevious: boolean;

  @ApiProperty({ description: 'Has next page' })
  hasNext: boolean;
}
