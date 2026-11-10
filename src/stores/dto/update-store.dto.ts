import { PartialType } from '@nestjs/swagger';
import { CreateStoreDto } from './create-store.dto';

/**
 * DTO para la actualización parcial de una tienda.
 * Hereda las validaciones de CreateStoreDto con todos los campos opcionales.
 */
export class UpdateStoreDto extends PartialType(CreateStoreDto) {}
