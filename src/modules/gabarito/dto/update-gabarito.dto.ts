import { PartialType } from '@nestjs/mapped-types';
import { CreateUpdateGabaritoDto } from './create-gabarito.dto';

export class UpdateGabaritoDto extends PartialType(CreateUpdateGabaritoDto) {}
