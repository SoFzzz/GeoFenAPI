import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ReportPriceDto } from './report-price.dto';

/**
 * BulkPricesDto: lote de precios para POST /prices/bulk (de 1 a 1000 elementos).
 */
export class BulkPricesDto {
  @ApiProperty({ type: [ReportPriceDto], maxItems: 1000 })
  @IsArray({ message: 'prices debe ser un arreglo' })
  @ArrayMinSize(1, { message: 'Debes enviar al menos un precio' })
  @ArrayMaxSize(1000, { message: 'No puedes enviar más de 1000 precios por petición' })
  @ValidateNested({ each: true })
  @Type(() => ReportPriceDto)
  prices: ReportPriceDto[];
}
