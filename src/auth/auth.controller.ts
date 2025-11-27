import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { IsString, IsNotEmpty } from 'class-validator';

class GenerateTokenDto {
  @ApiProperty({
    description: 'Username for token generation',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  username: string;
}

class TokenResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  access_token: string;

  @ApiProperty({ description: 'Token expiration time' })
  expires_in: string;
}

@ApiTags('Auth (Public)')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Post('generate-token')
  @ApiOperation({
    summary: 'Generate JWT token for testing',
    description:
      'This endpoint generates a JWT token for accessing private reports endpoints. In production, this should be replaced with proper authentication.',
  })
  @ApiResponse({
    status: 201,
    description: 'Token generated successfully',
    type: TokenResponseDto,
  })
  generateToken(@Body() generateTokenDto: GenerateTokenDto): TokenResponseDto {
    const payload = {
      sub: '1',
      username: generateTokenDto.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
      expires_in: '24h',
    };
  }
}
