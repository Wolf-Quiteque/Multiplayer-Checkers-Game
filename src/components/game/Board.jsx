'use client';

import React from 'react';
import { Square } from '@/components/game/Square';
import { Piece } from '@/components/game/Piece';
import { useGame } from '@/hooks/useGame';

export const Board = () => {
  const { board, selectedPiece, validMoves, handleSquareClick } = useGame();

  return (
    <div className="grid grid-cols-8 gap-0 w-full max-w-[500px] aspect-square border-2 border-gray-800 mx-auto rounded-md overflow-hidden shadow-lg">
      {board.map((row, rowIndex) => (
        row.map((square, colIndex) => {
          const isBlack = (rowIndex + colIndex) % 2 === 1;
          const isSelected = selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex;
          const isValidMove = validMoves.some(move =>
            move.row === rowIndex && move.col === colIndex
          );

          return (
            <Square
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              isBlack={isBlack}
              isSelected={isSelected}
              isValidMove={isValidMove}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            >
              {square && <Piece piece={square} />}
            </Square>
          );
        })
      ))}
    </div>
  );
};
