import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOfferDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  listingIds: string[];

  @IsNumber()
  @Type(() => Number)
  totalPrice: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  negotiatedPrice?: number;

  @IsOptional()
  @IsString()
  receiverId?: string;
}

export class CounterOfferDto {
  @IsNumber()
  @Type(() => Number)
  negotiatedPrice: number;
}
