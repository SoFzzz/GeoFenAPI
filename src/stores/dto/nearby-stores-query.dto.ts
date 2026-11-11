import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class NearbyStoresQueryDto {
  @ApiProperty({ example: 1.2136, description: 'Latitud del punto de búsqueda' })
  @Type(() => Number)
  @IsNumber({}, { message: 'lat debe ser un número' })
  @Min(-90, { message: 'lat no puede ser menor a -90' })
  @Max(90, { message: 'lat no puede ser mayor a 90' })
  lat: number;

  @ApiProperty({ example: -77.2811, description: 'Longitud del punto de búsqueda' })
  @Type(() => Number)
  @IsNumber({}, { message: 'lng debe ser un número' })
  @Min(-180, { message: 'lng no puede ser menor a -180' })
  @Max(180, { message: 'lng no puede ser mayor a 180' })
  lng: number;

  @ApiPropertyOptional({ example: 5, default: 5, description: 'Radio de búsqueda en kilómetros' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'radiusKm debe ser un número' })
  @Min(0.1, { message: 'radiusKm debe ser al menos 0.1' })
  @Max(100, { message: 'radiusKm no puede superar 100' })
  radiusKm: number = 5;

  @ApiPropertyOptional({ example: 'Éxito', description: 'Filtra por cadena comercial' })
  @IsOptional()
  @IsString({ message: 'chain debe ser texto' })
  chain?: string;
}
