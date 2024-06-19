import { TRepositorio } from 'src/types/repositorio.type';

export const memory: TRepositorio = {
  avaliacoes: new Map(),
  gabarito: {
    respostas: [],
  },
};
