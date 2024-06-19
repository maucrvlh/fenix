export type TAvaliacao = {
  idAluno: number;
  idTurma: number;
  respostas: string[];
};
export type TAvaliacaoMap = Map<string, TAvaliacao>;
