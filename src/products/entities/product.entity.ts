import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('products')
export class Product {
  @ApiProperty({ description: 'Product UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Contentful ID' })
  @Column({ unique: true })
  contentfulId: string;

  @ApiProperty({ description: 'Product name' })
  @Column()
  name: string;

  @ApiPropertyOptional({ description: 'Product SKU' })
  @Column('int', { nullable: true })
  sku: number;

  @ApiPropertyOptional({ description: 'Product brand' })
  @Column({ nullable: true })
  brand: string;

  @ApiPropertyOptional({ description: 'Product model' })
  @Column({ nullable: true })
  model: string;

  @ApiPropertyOptional({ description: 'Product category' })
  @Column({ nullable: true })
  category: string;

  @ApiPropertyOptional({ description: 'Product color' })
  @Column({ nullable: true })
  color: string;

  @ApiPropertyOptional({ description: 'Product price' })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price: number;

  @ApiPropertyOptional({ description: 'Currency code' })
  @Column({ nullable: true })
  currency: string;

  @ApiPropertyOptional({ description: 'Stock quantity' })
  @Column('int', { nullable: true })
  stock: number;

  @ApiPropertyOptional({ description: 'Product description' })
  @Column('text', { nullable: true })
  description: string;

  @ApiPropertyOptional({ description: 'Soft delete timestamp' })
  @DeleteDateColumn()
  deletedAt: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
