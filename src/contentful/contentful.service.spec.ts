/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ContentfulService } from './contentful.service';

describe('ContentfulService', () => {
  let service: ContentfulService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'contentful.spaceId': 'test-space-id',
        'contentful.accessToken': 'test-access-token',
        'contentful.environment': 'master',
        'contentful.type': 'product',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockConfigService.get.mockImplementation((key: string) => {
      const config = {
        'contentful.spaceId': 'test-space-id',
        'contentful.accessToken': 'test-access-token',
        'contentful.environment': 'master',
        'contentful.type': 'product',
      };
      return config[key];
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentfulService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ContentfulService>(ContentfulService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error if spaceId is missing', async () => {
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'contentful.spaceId') return undefined;
      if (key === 'contentful.accessToken') return 'test-token';
      return 'master';
    });

    await expect(async () => {
      await Test.createTestingModule({
        providers: [
          ContentfulService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();
    }).rejects.toThrow(
      'Contentful credentials (spaceId and accessToken) are required',
    );
  });

  it('should throw error if accessToken is missing', async () => {
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'contentful.spaceId') return 'test-space';
      if (key === 'contentful.accessToken') return undefined;
      return 'master';
    });

    await expect(async () => {
      await Test.createTestingModule({
        providers: [
          ContentfulService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();
    }).rejects.toThrow(
      'Contentful credentials (spaceId and accessToken) are required',
    );
  });
});
