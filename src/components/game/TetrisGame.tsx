'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useBetting } from '@/context/BettingContext';

// Tetris game logic implementation
const createBoard = () => Array(20).fill(Array(10).fill(0));

const pieces = [
  [[1,1,1,1]], // I
  [[1,1],[1,1]], // O
  [[0,1,1],[1,1,0]], // S
  [[1,1,0],[0,1,1]], // Z
  [[1,0,0],[1,1,1]], // L
  [[0,0,1],[1,1,1]], // J
  [[0,1,0],[1,1,1]]  // T
];

const pieceColors = [
  'bg-cyan-500', // I
  'bg-yellow-500', // O
  'bg-green-500', // S
  'bg-red-500', // Z
  'bg-orange-500', // L
  'bg-blue-500', // J
  'bg-purple-500' // T
];

function getRandomPiece() {
  const pieceIndex = Math.floor(Math.random() * pieces.length);
  return {
    shape: pieces[pieceIndex],
    color: pieceColors[pieceIndex]
  };
}

export default function TetrisGame() {
  const [board, setBoard] = useState(createBoard());
  const [piece, setPiece] = useState(getRandomPiece());
  const [position, setPosition] = useState({ x: 4, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const { placeBet, currentBet, resetBetting } = useBetting();
  const [hasBet, setHasBet] = useState(false);
  const [isGameRunning, setIsGameRunning] = useState(false);

  const rotatePiece = (pieceShape: number[][]) => {
    const rows = pieceShape.length;
    const cols = pieceShape[0].length;
    const rotatedPiece: number[][] = Array(cols).fill(null).map(() => Array(rows).fill(0));

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotatedPiece[j][rows - 1 - i] = pieceShape[i][j];
      }
    }

    return rotatedPiece;
  };

  const canMove = (newBoard: number[][], pieceShape: number[][], position: { x: number; y: number }) => {
    for (let y = 0; y < pieceShape.length; y++) {
      for (let x = 0; x < pieceShape[y].length; x++) {
        if (pieceShape[y][x] !== 0) {
          let boardX = position.x + x;
          let boardY = position.y + y;

          if (boardX < 0 || boardX >= 10 || boardY >= 20 || (newBoard[boardY] && newBoard[boardY][boardX] !== 0)) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const mergePiece = (newBoard: number[][], piece: { shape: number[][]; color: string }, position: { x: number; y: number }) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] !== 0) {
          newBoard[position.y + y][position.x + x] = 1; // Use 1 for filled cell, color will be applied during render
        }
      }
    }
    return newBoard;
  };

  const clearLines = (newBoard: number[][]) => {
    let linesCleared = 0;
    const boardAfterClear = newBoard.filter(row => row.some(cell => cell === 0));
    linesCleared = 20 - boardAfterClear.length;

    while(boardAfterClear.length < 20) {
      boardAfterClear.unshift(Array(10).fill(0));
    }

    return { newBoard: boardAfterClear, linesCleared };
  };

  const moveDown = useCallback(() => {
    if (!gameOver && hasBet && isGameRunning) {
      const newPosition = { ...position, y: position.y + 1 };
      if (canMove(board, piece.shape, newPosition)) {
        setPosition(newPosition);
      } else {
        let newBoard = board.map(row => [...row]);
        newBoard = mergePiece(newBoard, piece, position);

        const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
        setBoard(clearedBoard);
        setScore(score + linesCleared * 100);

        const nextPiece = getRandomPiece();
        setPiece(nextPiece);
        setPosition({ x: 4, y: 0 });

        if (!canMove(clearedBoard, nextPiece.shape, { x: 4, y: 0 })) {
          setGameOver(true);
          setIsGameRunning(false); // Stop game on game over
        }
      }
    }
  }, [gameOver, hasBet, isGameRunning, board, piece, position, score]);

  const moveHorizontally = (direction: number) => {
    if (!gameOver && hasBet && isGameRunning) {
      const newPosition = { ...position, x: position.x + direction };
      if (canMove(board, piece.shape, newPosition)) {
        setPosition(newPosition);
      }
    }
  };

  const dropPiece = () => {
    if (!gameOver && hasBet && isGameRunning) {
      let newPosition = { ...position };
      while (canMove(board, piece.shape, { ...newPosition, y: newPosition.y + 1 })) {
        newPosition.y++;
      }
      setPosition(newPosition);
      // Trigger moveDown after dropping to merge the piece
      moveDown();
    }
  };

  useEffect(() => {
    if (!hasBet || !isGameRunning) return;

    const intervalId = setInterval(() => {
      moveDown();
    }, 500);

    return () => clearInterval(intervalId);
  }, [moveDown, hasBet, isGameRunning]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameOver || !hasBet || !isGameRunning) return;
    switch (e.key) {
      case 'ArrowLeft': moveHorizontally(-1); break;
      case 'ArrowRight': moveHorizontally(1); break;
      case 'ArrowDown': moveDown(); break;
      case 'ArrowUp':
        const rotatedPieceShape = rotatePiece(piece.shape);
        if (canMove(board, rotatedPieceShape, position)) {
          setPiece({ shape: rotatedPieceShape, color: piece.color });
        }
        break;
      case ' ': dropPiece(); break;
    }
  }, [gameOver, hasBet, isGameRunning, board, piece, position, moveHorizontally, moveDown, dropPiece, rotatePiece]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const renderBoard = () => {
    const boardWithPiece = board.map(row => [...row]);
    if (!gameOver && hasBet && isGameRunning) {
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x] !== 0) {
            const boardX = position.x + x;
            const boardY = position.y + y;
            if (boardY >= 0 && boardY < 20 && boardX >= 0 && boardX < 10) {
              boardWithPiece[boardY][boardX] = piece.color; // Store color in board for rendering
            }
          }
        }
      }
    }
    return boardWithPiece;
  };


  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-gray-100 rounded-lg shadow-lg">
      <div className="flex justify-between w-full">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Score: {score}</h2>
          {currentBet > 0 && <h3 className="text-xl">Bet: ${currentBet}</h3>}
        </div>
        {!hasBet && currentBet > 0 ? (
          <Button onClick={() => setHasBet(true)} className="h-12 px-6">
            Place Bet
          </Button>
        ) : hasBet && !isGameRunning ? (
           <Button onClick={() => setIsGameRunning(true)} className="h-12 px-6">
            Start Tetris
          </Button>
        ) : (
          <Button
            variant="destructive"
            onClick={() => {
              setGameOver(true);
              setIsGameRunning(false); // Stop game on end
              resetBetting();
            }}
            className="h-12 px-6"
          >
            End Game
          </Button>
        )}
      </div>

      <div className="border-4 border-blue-200 bg-blue-50 p-2 rounded" style={{ width: '200px', height: '400px' }}>
        {renderBoard().map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell: number | string, x: number) => (
              <div
                key={x}
                className={`w-8 h-8 border ${cell !== 0 ? (typeof cell === 'string' ? cell : 'bg-blue-500') : 'bg-white'}`}
                data-testid={`tetris-block-${y}-${x}`}
                style={{ width: '20px', height: '20px' }}
              />
            ))}
          </div>
        ))}
      </div>

      {gameOver && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg text-center">
            <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
            <p className="text-xl mb-6">Final Score: {score}</p>
            <Button
              onClick={() => {
                setGameOver(false);
                setBoard(createBoard());
                setScore(0);
                setHasBet(false); // Reset bet state
                setIsGameRunning(false); // Reset game running state
                resetBetting(); // Reset betting context
              }}
              className="h-12 px-8 text-lg"
            >
              Play Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
