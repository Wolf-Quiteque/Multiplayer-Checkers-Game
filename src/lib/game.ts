import { Board, Position, PieceColor } from '@/types/game';

export const initialBoard: Board = Array(8).fill(null).map((_, row) => {
  return Array(8).fill(null).map((_, col) => {
    // Only place pieces on black squares
    if ((row + col) % 2 !== 1) return null;

    // Black pieces (top 3 rows)
    if (row < 3) {
      return { color: 'black', type: 'normal' };
    }

    // White pieces (bottom 3 rows)
    if (row > 4) {
      return { color: 'white', type: 'normal' };
    }

    // Empty middle rows
    return null;
  });
});

export const getValidMoves = (row: number, col: number, board: Board) => {
  const piece = board[row][col];
  if (!piece) return [];

  const moves: Position[] = [];
  const captureMoves: Position[] = [];
  const direction = piece.color === 'black' ? 1 : -1;

  const checkCaptures = (r: number, c: number, dirRow: number, dirCol: number, isKing = false) => {
    const jumpedRow = r + dirRow;
    const jumpedCol = c + dirCol;
    const landRow = r + dirRow * 2;
    const landCol = c + dirCol * 2;

    if (landRow >= 0 && landRow < 8 && landCol >= 0 && landCol < 8) {
      const jumpedPiece = board[jumpedRow][jumpedCol];
      if (jumpedPiece && jumpedPiece.color !== piece.color && !board[landRow][landCol]) {
        captureMoves.push({ row: landRow, col: landCol });
        if (isKing) {
          // For kings, check if can continue capturing
          const newBoard = [...board.map(r => [...r])];
          newBoard[r][c] = null;
          newBoard[jumpedRow][jumpedCol] = null;
          newBoard[landRow][landCol] = piece;
          checkCaptures(landRow, landCol, dirRow, dirCol, true);
        }
      }
    }
  };

  // Check for captures first (mandatory capture rule)
  if (piece.type === 'normal') {
    for (let colDir of [-1, 1]) {
      checkCaptures(row, col, direction, colDir);
    }
  } else {
    // King captures
    for (let rowDir of [-1, 1]) {
      for (let colDir of [-1, 1]) {
        checkCaptures(row, col, rowDir, colDir, true);
      }
    }
  }

  // If there are captures, only return those
  if (captureMoves.length > 0) {
    return captureMoves;
  }

  // Normal moves (only if no captures available)
  if (piece.type === 'normal') {
    for (let colDir of [-1, 1]) {
      const newRow = row + direction;
      const newCol = col + colDir;
      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8 && !board[newRow][newCol]) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  } else {
    // King moves
    for (let rowDir of [-1, 1]) {
      for (let colDir of [-1, 1]) {
        let newRow = row + rowDir;
        let newCol = col + colDir;
        while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          if (!board[newRow][newCol]) {
            moves.push({ row: newRow, col: newCol });
          } else {
            break;
          }
          newRow += rowDir;
          newCol += colDir;
        }
      }
    }
  }

  return moves;
};

export const checkWinCondition = (board: Board): PieceColor | null => {
  let blackPieces = 0;
  let whitePieces = 0;

  for (let row of board) {
    for (let piece of row) {
      if (piece?.color === 'black') blackPieces++;
      if (piece?.color === 'white') whitePieces++;
    }
  }

  if (blackPieces === 0) return 'white';
  if (whitePieces === 0) return 'black';
  return null;
};
