/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportsService } from './reports.service';
import { Product } from '../products/entities/product.entity';

describe('ReportsService', () => {
  let service: ReportsService;
  let repository: Repository<Product>;

  const mockRepository = {
    count: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDeletedProductsReport', () => {
    it('should return deleted products statistics', async () => {
      mockRepository.count
        .mockResolvedValueOnce(10000)
        .mockResolvedValueOnce(150);

      const result = await service.getDeletedProductsReport();

      expect(result).toEqual({
        totalProducts: 10000,
        deletedProducts: 150,
        deletedPercentage: 1.5,
      });
      expect(mockRepository.count).toHaveBeenCalledTimes(2);
    });

    it('should handle zero products', async () => {
      mockRepository.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);

      const result = await service.getDeletedProductsReport();

      expect(result).toEqual({
        totalProducts: 0,
        deletedProducts: 0,
        deletedPercentage: 0,
      });
    });
  });

  describe('getNonDeletedProductsReport', () => {
    it('should return non-deleted products statistics without date range', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest
          .fn()
          .mockResolvedValueOnce(9850)
          .mockResolvedValueOnce(8500),
        clone: jest.fn().mockReturnThis(),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getNonDeletedProductsReport({});

      expect(result).toEqual({
        totalNonDeleted: 9850,
        withPrice: 8500,
        withoutPrice: 1350,
        withPricePercentage: 86.29,
        withoutPricePercentage: 13.71,
        dateRange: undefined,
      });
    });

    it('should apply date range filter', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-12-31');

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest
          .fn()
          .mockResolvedValueOnce(5000)
          .mockResolvedValueOnce(4000),
        clone: jest.fn().mockReturnThis(),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getNonDeletedProductsReport({
        startDate,
        endDate,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.createdAt BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
      expect(result.dateRange).toBeDefined();
    });
  });

  describe('getProductsByCategoryReport', () => {
    it('should return products distribution by category', async () => {
      const mockProducts = [
        { category: 'Electronics' },
        { category: 'Electronics' },
        { category: 'Electronics' },
        { category: 'Clothing' },
        { category: 'Clothing' },
        { category: null },
      ];

      mockRepository.find.mockResolvedValue(mockProducts);

      const result = await service.getProductsByCategoryReport();

      expect(result.totalProducts).toBe(6);
      expect(result.distribution).toHaveLength(3);
      expect(result.distribution[0]).toEqual({
        category: 'Electronics',
        count: 3,
        percentage: 50,
      });
      expect(result.distribution[1]).toEqual({
        category: 'Clothing',
        count: 2,
        percentage: 33.33,
      });
      expect(result.distribution[2]).toEqual({
        category: 'Uncategorized',
        count: 1,
        percentage: 16.67,
      });
    });

    it('should handle empty products list', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.getProductsByCategoryReport();

      expect(result.totalProducts).toBe(0);
      expect(result.distribution).toEqual([]);
    });
  });
});
