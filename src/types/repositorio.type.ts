import { TAvaliacaoMap } from './avaliacao.type';
import { TGabarito } from './gabarito.type';

export type TRepositorio = {
  gabarito: TGabarito;
  avaliacoes: TAvaliacaoMap;
};
