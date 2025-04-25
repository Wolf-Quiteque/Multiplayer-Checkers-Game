export type PieceColor = 'black' | 'white';
export type PieceType = 'normal' | 'king';

export interface Piece {
  color: PieceColor;
  type: PieceType;
}

export interface Position {
  row: number;
  col: number;
}

export type Board = (Piece | null)[][];
