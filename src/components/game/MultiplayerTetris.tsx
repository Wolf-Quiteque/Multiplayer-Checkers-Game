'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useBetting } from '@/context/BettingContext';
import { subscribeToGameRoom, makeMove, GameRoom } from '@/lib/gameRoom';
import { subscribeToMessages, sendMessage } from '@/lib/gameRoom';
import { auth } from '@/lib/firebase';

export default function MultiplayerTetris({ roomId }: { roomId?: string }) {
  if (!roomId) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Error: Missing Room ID</h2>
        <p className="text-xl mb-6">Please join a valid game room</p>
        <Button 
          onClick={() => window.location.href = '/multiplayer'}
          className="h-12 px-8 text-lg"
        >
          Back to Lobby
        </Button>
      </div>
    );
  }

  const [board, setBoard] = useState(Array(20).fill(Array(10).fill(0)));
  const [piece, setPiece] = useState({
    shape: [[1,1,1,1]],
    color: 'bg-cyan-500'
  });
  const [position, setPosition] = useState({ x: 4, y: 0 });
  const [score, setScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const { currentBet, distributeWinnings } = useBetting();
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToGameRoom(roomId, (room) => {
      setGameRoom(room);
      if (room.gameType === 'tetris') {
        const isBlackPlayer = auth.currentUser?.uid === room.blackPlayerId;
        const opponentBoard = isBlackPlayer ? room.whitePlayerBoard : room.blackPlayerBoard;
        const opponentScore = isBlackPlayer ? room.whitePlayerScore : room.blackPlayerScore;
        
        if (opponentBoard) setOpponentScore(opponentScore || 0);
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(roomId, setMessages);
    return () => unsubscribe();
  }, [roomId]);

  const startGame = () => {
    setIsGameRunning(true);
    makeMove(roomId, [], 'black', null, {
      playerBoard: board,
      playerScore: score,
      currentPiece: { shape: piece.shape, position }
    });
  };

  const endGame = () => {
    setIsGameRunning(false);
    setGameOver(true);
    makeMove(roomId, [], 'black', 'black', {
      playerBoard: board,
      playerScore: score
    });
    
    const isWinner = score > opponentScore;
    distributeWinnings(isWinner ? 'player' : 'opponent');
  };

  const updateGameState = useCallback(() => {
    if (isGameRunning) {
      makeMove(roomId, [], 'black', null, {
        playerBoard: board,
        playerScore: score,
        currentPiece: { shape: piece.shape, position }
      });
    }
  }, [isGameRunning, roomId, board, score, piece, position]);

  useEffect(() => {
    const interval = setInterval(updateGameState, 1000);
    return () => clearInterval(interval);
  }, [updateGameState]);

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-gray-100 rounded-lg shadow-lg">
      <div className="flex justify-between w-full">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Your Score: {score}</h2>
          <h2 className="text-2xl font-bold">Opponent: {opponentScore}</h2>
          {currentBet > 0 && <h3 className="text-xl">Bet: ${currentBet}</h3>}
        </div>
        
        {!isGameRunning ? (
          <Button onClick={startGame} className="h-12 px-6">Start Game</Button>
        ) : (
          <Button variant="destructive" onClick={endGame} className="h-12 px-6">End Game</Button>
        )}
      </div>

      <div className="flex gap-8 w-full">
        <div className="border-4 border-blue-200 bg-blue-50 p-2 rounded" style={{ width: '200px', height: '400px' }}>
          {board.map((row, y) => (
            <div key={y} className="flex">
              {row.map((cell: number, x: number) => (
                <div key={x} className={`w-8 h-8 border ${cell ? 'bg-blue-500' : 'bg-white'}`} />
              ))}
            </div>
          ))}
        </div>

        <div className="border-4 border-red-200 bg-red-50 p-2 rounded" style={{ width: '200px', height: '400px' }}>
          {gameRoom?.whitePlayerBoard?.map((row, y) => (
            <div key={y} className="flex">
              {row.map((cell: number, x: number) => (
                <div key={x} className={`w-8 h-8 border ${cell ? 'bg-red-500' : 'bg-white'}`} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full bg-white p-4 rounded-lg shadow">
        <div className="h-40 overflow-y-auto mb-4">
          {messages.map((msg) => (
            <div key={msg.id} className="mb-2">
              <span className="font-bold">{msg.senderName}: </span>
              <span>{msg.text}</span>
            </div>
          ))}
        </div>
        <input
          type="text"
          placeholder="Type a message..."
          className="w-full p-2 border rounded"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value) {
              sendMessage(roomId, e.currentTarget.value, 'Player');
              e.currentTarget.value = '';
            }
          }}
        />
      </div>

      {gameOver && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg text-center">
            <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
            <Button onClick={() => window.location.reload()} className="h-12 px-8 text-lg">
              Play Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
