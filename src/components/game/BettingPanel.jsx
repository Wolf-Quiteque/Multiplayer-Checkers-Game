'use client';

import { useBetting } from '@/context/BettingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const betAmounts = [100, 500, 1000, 2000];

export function BettingPanel() {
  const {
    playerBalance,
    opponentBalance,
    currentBet,
    placeBet
  } = useBetting();
  const [customAmount, setCustomAmount] = useState('');

  const handleCustomBet = () => {
    const amount = parseInt(customAmount);
    if (!isNaN(amount) && amount > 0) {
      placeBet(amount);
      setCustomAmount('');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center">Game Betting</h2>

      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg mb-4">
        <div className="text-center">
          <h3 className="text-sm text-gray-500">Your Balance</h3>
          <p className="text-2xl font-bold text-blue-600">${playerBalance.toLocaleString()}</p>
        </div>
        <div className="w-px h-12 bg-gray-300"></div>
        <div className="text-center">
          <h3 className="text-sm text-gray-500">Opponent Balance</h3>
          <p className="text-2xl font-bold text-red-600">${opponentBalance.toLocaleString()}</p>
        </div>
      </div>

      {currentBet > 0 ? (
        <div className="text-center mb-4 p-3 bg-green-50 rounded-lg animate-pulse">
          <h3 className="text-sm text-gray-500">Current Pot</h3>
          <p className="text-3xl font-bold text-green-600">${currentBet.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Game in progress. Winner takes all!</p>
        </div>
      ) : (
        <>
          <div className="text-center mb-3">
            <h3 className="text-sm text-gray-500 mb-1">Place Your Bet</h3>
            <p className="text-xs text-gray-500 mb-3">Select an amount to bet before starting the game</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {betAmounts.map(amount => (
              <Button
                key={amount}
                onClick={() => placeBet(amount)}
                disabled={playerBalance < amount || opponentBalance < amount}
                className={`h-14 text-lg font-semibold ${playerBalance < amount || opponentBalance < amount ? 'opacity-50' : 'hover:scale-105 transition-transform'}`}
                variant={playerBalance < amount || opponentBalance < amount ? "outline" : "default"}
              >
                ${amount.toLocaleString()}
              </Button>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent h-px"></div>
            <div className="flex justify-center -mt-3">
              <span className="bg-white px-2 text-xs text-gray-400">OR</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Input
              type="number"
              placeholder="Enter custom amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="text-center h-12"
              min="1"
              max={Math.min(playerBalance, opponentBalance)}
            />
            <Button
              onClick={handleCustomBet}
              disabled={
                !customAmount ||
                isNaN(parseInt(customAmount)) ||
                playerBalance < parseInt(customAmount) ||
                opponentBalance < parseInt(customAmount)
              }
              className="h-12"
            >
              Place Bet
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
