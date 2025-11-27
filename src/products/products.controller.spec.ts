/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;

  const mockProductsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockResult = {
        data: [],
        page: 1,
        limit: 5,
        total: 0,
        totalPages: 0,
        hasPrevious: false,
        hasNext: false,
      };

      mockProductsService.findAll.mockResolvedValue(mockResult);

      const query = { page: 1, limit: 5 };
      const result = await controller.findAll(query);

      expect(result).toEqual(mockResult);
      expect(mockProductsService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const mockProduct = {
        id: '1',
        contentfulId: 'cf1',
        name: 'Test Product',
        sku: 123,
        brand: 'Test Brand',
        model: 'Test Model',
        category: 'Test Category',
        color: 'Red',
        price: 99.99,
        currency: 'USD',
        stock: 10,
        description: 'Test description',
        deletedAt: null as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockProduct);
      expect(mockProductsService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('remove', () => {
    it('should soft delete a product', async () => {
      mockProductsService.softDelete.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockProductsService.softDelete).toHaveBeenCalledWith('1');
    });
  });
});
