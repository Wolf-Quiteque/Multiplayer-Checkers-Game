'use client';

import { useState } from 'react';
import { Board } from '@/components/game/Board';
import TetrisGame from '@/components/game/TetrisGame';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BettingPanel } from '@/components/game/BettingPanel';
import { useGame } from '@/hooks/useGame';
import { useBetting } from '@/context/BettingContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function GamePage() {
  const [gameType, setGameType] = useState('checkers');
  const game = useGame();
  const betting = useBetting();

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="flex flex-col items-center">
          <div className="w-full flex flex-col items-center gap-4 mb-6">
            <div className="w-full flex justify-between items-center">
              <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Home</span>
              </Link>
              <div className="w-24"></div> {/* Spacer for centering */}
            </div>

            <Select value={gameType} onValueChange={(v) => setGameType(v)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select game type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checkers">Checkers</SelectItem>
                <SelectItem value="tetris">Tetris</SelectItem>
              </SelectContent>
            </Select>

            <h1 className="text-2xl md:text-3xl font-bold text-center">
              {gameType === 'tetris' ? 'Tetris' : 'Checkers'} Game
            </h1>
        </div>

        {game.winner ? (
          <div className="mb-6 w-full">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center shadow-md">
              <div className="mb-2">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium uppercase">Game Over</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-green-600 mb-2">
                {game.winner.toUpperCase()} wins!
              </h2>
              {betting.currentBet > 0 && (
                <p className="text-xl font-semibold text-gray-700 mb-4">
                  Prize: <span className="text-green-500">${betting.currentBet.toLocaleString()}</span>
                </p>
              )}
              <Button
                onClick={() => {
                  game.resetGame();
                  betting.resetBetting();
                }}
                className="px-6 py-3 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Play Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full mb-6">
            <div className="flex justify-between items-center px-4 py-3 bg-blue-50 rounded-lg shadow-sm">
              <div>
                <p className="text-sm text-gray-500">Current Turn</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${game.currentPlayer === 'black' ? 'bg-black' : 'bg-red-500'}`}></div>
                  <p className="font-bold capitalize">{game.currentPlayer}</p>
                </div>
              </div>

              {game.selectedPiece && (
                <div className="bg-yellow-50 px-3 py-1 rounded-md text-sm">
                  <p className="text-yellow-700">Piece selected</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          <div className="lg:col-span-2 order-2 lg:order-1">
            {gameType === 'tetris' ? <TetrisGame /> : <Board />}
          </div>
          <div className="order-1 lg:order-2">
            <BettingPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
