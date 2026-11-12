import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { CreateStoreDto } from './create-store.dto';

/**
 * BulkStoresDto: lote de tiendas para POST /stores/bulk (de 1 a 500 elementos).
 */
export class BulkStoresDto {
  @ApiProperty({ type: [CreateStoreDto], maxItems: 500 })
  @IsArray({ message: 'stores debe ser un arreglo' })
  @ArrayMinSize(1, { message: 'Debes enviar al menos una tienda' })
  @ArrayMaxSize(500, { message: 'No puedes enviar más de 500 tiendas por petición' })
  @ValidateNested({ each: true })
  @Type(() => CreateStoreDto)
  stores: CreateStoreDto[];
}
