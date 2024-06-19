import { IsArray, IsNumber } from 'class-validator';

export class CreateAvaliacaoDto {
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'O campo idAluno deve ser um número válido' },
  )
  idAluno: number;

  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'O campo idTurma deve ser um número válido' },
  )
  idTurma: number;

  @IsArray({ message: 'O campo respostas deve ser um array de caracteres' })
  respostas: string[];
}
