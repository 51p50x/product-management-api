import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = controller.generateToken({ username: 'admin' });

      expect(result).toEqual({
        access_token: mockToken,
        expires_in: '24h',
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: '1',
        username: 'admin',
      });
    });
  });
});
