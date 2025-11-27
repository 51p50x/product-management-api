import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  DeletedProductsReportDto,
  NonDeletedProductsReportDto,
  ProductsByCategoryReportDto,
} from './dto/reports-response.dto';
import { DateRangeDto } from './dto/date-range.dto';

@ApiTags('Reports (Private)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('deleted-products')
  @ApiOperation({ summary: 'Get percentage of deleted products' })
  @ApiResponse({
    status: 200,
    description: 'Returns deleted products statistics',
    type: DeletedProductsReportDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  async getDeletedProductsReport(): Promise<DeletedProductsReportDto> {
    return this.reportsService.getDeletedProductsReport();
  }

  @Get('non-deleted-products')
  @ApiOperation({
    summary:
      'Get percentage of non-deleted products with/without price and date range',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns non-deleted products statistics',
    type: NonDeletedProductsReportDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date (YYYY-MM-DD)',
  })
  async getNonDeletedProductsReport(
    @Query() dateRangeDto: DateRangeDto,
  ): Promise<NonDeletedProductsReportDto> {
    return this.reportsService.getNonDeletedProductsReport(dateRangeDto);
  }

  @Get('products-by-category')
  @ApiOperation({
    summary: 'Get distribution of products by category (custom report)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns product distribution by category',
    type: ProductsByCategoryReportDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  async getProductsByCategoryReport(): Promise<ProductsByCategoryReportDto> {
    return this.reportsService.getProductsByCategoryReport();
  }
}
