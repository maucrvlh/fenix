import { IsArray } from 'class-validator';

export class CreateUpdateGabaritoDto {
  @IsArray({ message: 'O campo respostas deve ser um array de caracteres' })
  respostas: string[];
}
