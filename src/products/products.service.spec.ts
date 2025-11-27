/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductsService, ContentfulProduct } from './products.service';
import { Product } from './entities/product.entity';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockRepository = {
    count: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(),
    manager: {
      transaction: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockProducts: Product[] = [
        {
          id: '1',
          contentfulId: 'cf1',
          name: 'Product 1',
          sku: 123,
          brand: 'Brand A',
          model: 'Model X',
          category: 'Electronics',
          color: 'Black',
          price: 99.99,
          currency: 'USD',
          stock: 10,
          description: 'Test product',
          deletedAt: null as any,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockProducts, 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({ page: 1, limit: 5 });

      expect(result).toEqual({
        data: mockProducts,
        page: 1,
        limit: 5,
        total: 1,
        totalPages: 1,
        hasPrevious: false,
        hasNext: false,
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'product.deletedAt IS NULL',
      );
    });

    it('should apply filters correctly', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll({
        page: 1,
        limit: 5,
        name: 'Test',
        category: 'Electronics',
        minPrice: 10,
        maxPrice: 100,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.name ILIKE :name',
        {
          name: '%Test%',
        },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.category ILIKE :category',
        {
          category: '%Electronics%',
        },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.price >= :minPrice',
        {
          minPrice: 10,
        },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.price <= :maxPrice',
        {
          maxPrice: 100,
        },
      );
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const mockProduct: Product = {
        id: '1',
        contentfulId: 'cf1',
        name: 'Product 1',
        sku: 123,
        brand: 'Brand A',
        model: 'Model X',
        category: 'Electronics',
        color: 'Black',
        price: 99.99,
        currency: 'USD',
        stock: 10,
        description: 'Test product',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne('1');

      expect(result).toEqual(mockProduct);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', deletedAt: expect.anything() },
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a product', async () => {
      const mockProduct: Product = {
        id: '1',
        contentfulId: 'cf1',
        name: 'Product 1',
        sku: 123,
        brand: 'Brand A',
        model: 'Model X',
        category: 'Electronics',
        color: 'Black',
        price: 99.99,
        currency: 'USD',
        stock: 10,
        description: 'Test product',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockProduct);
      mockRepository.softDelete.mockResolvedValue({ affected: 1, raw: [] });

      await service.softDelete('1');

      expect(mockRepository.softDelete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if product not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.softDelete('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('upsertManyFromContentful', () => {
    it('should return early if items array is empty', async () => {
      await service.upsertManyFromContentful([]);

      expect(mockRepository.manager.transaction).not.toHaveBeenCalled();
    });

    it('should insert products in batches', async () => {
      const mockItems: ContentfulProduct[] = [
        {
          id: 'cf1',
          name: 'Product 1',
          sku: 123,
          brand: 'Brand A',
          model: 'Model X',
          category: 'Electronics',
          color: 'Black',
          price: 99.99,
          currency: 'USD',
          stock: 10,
        },
      ];

      const mockTransactionManager = {
        createQueryBuilder: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnThis(),
          into: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          orIgnore: jest.fn().mockReturnThis(),
          execute: jest
            .fn()
            .mockResolvedValue({ raw: [], identifiers: [{ id: '1' }] }),
        }),
      };

      mockRepository.manager.transaction.mockImplementation(async (cb) => {
        return cb(mockTransactionManager);
      });

      await service.upsertManyFromContentful(mockItems);

      expect(mockRepository.manager.transaction).toHaveBeenCalled();
    });
  });
});
