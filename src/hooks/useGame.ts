'use client';

import { useState, useEffect } from 'react';
import { useBetting } from '@/context/BettingContext';
import { Board, Position, PieceColor } from '@/types/game';
import { initialBoard, getValidMoves, checkWinCondition } from '../lib/game';

export const useGame = () => {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('black');
  const [winner, setWinner] = useState<PieceColor | null>(null);

  // Check for win condition after each move
  const { distributeWinnings } = useBetting();

  useEffect(() => {
    const gameWinner = checkWinCondition(board);
    if (gameWinner) {
      setWinner(gameWinner);
      distributeWinnings(gameWinner === 'black' ? 'player' : 'opponent');
    }
  }, [board, distributeWinnings]);

  const handleSquareClick = (row: number, col: number) => {
    if (winner) return; // Game is over

    const clickedSquare = board[row][col];

    // If no piece selected and clicked square has current player's piece
    if (!selectedPiece && clickedSquare?.color === currentPlayer) {
      setSelectedPiece({ row, col });
      setValidMoves(getValidMoves(row, col, board));
      return;
    }

    // If piece is already selected
    if (selectedPiece) {
      // If clicking same piece, deselect it
      if (selectedPiece.row === row && selectedPiece.col === col) {
        setSelectedPiece(null);
        setValidMoves([]);
        return;
      }

      // If valid move, move the piece
      const isValidMove = validMoves.some(move => 
        move.row === row && move.col === col
      );

      if (isValidMove) {
        const newBoard = [...board.map(r => [...r])];
        const piece = newBoard[selectedPiece.row][selectedPiece.col];
        
        // Check if this is a capture move
        const isCapture = Math.abs(row - selectedPiece.row) === 2;
        
        // Move the piece
        newBoard[selectedPiece.row][selectedPiece.col] = null;
        newBoard[row][col] = piece;

        // Remove captured piece if this was a capture
        if (isCapture) {
          const jumpedRow = (selectedPiece.row + row) / 2;
          const jumpedCol = (selectedPiece.col + col) / 2;
          newBoard[jumpedRow][jumpedCol] = null;
        }

        // Check for king promotion
        if ((piece?.color === 'black' && row === 7) || 
            (piece?.color === 'white' && row === 0)) {
          newBoard[row][col] = { ...piece!, type: 'king' };
        }

        setBoard(newBoard);
        setSelectedPiece(null);
        setValidMoves([]);

        // If capture was made, check for additional captures
        if (isCapture) {
          const nextCaptures = getValidMoves(row, col, newBoard)
            .filter((move: Position) => Math.abs(move.row - row) === 2);
          
          if (nextCaptures.length > 0) {
            setSelectedPiece({ row, col });
            setValidMoves(nextCaptures);
            return;
          }
        }

        setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
      }
    }
  };

  const resetGame = () => {
    setBoard(initialBoard);
    setSelectedPiece(null);
    setValidMoves([]);
    setCurrentPlayer('black');
    setWinner(null);
  };

  return {
    board,
    selectedPiece,
    validMoves,
    currentPlayer,
    winner,
    handleSquareClick,
    resetGame
  };
};
