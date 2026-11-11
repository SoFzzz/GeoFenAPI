import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

/**
 * DTO para la actualización parcial de una categoría.
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
