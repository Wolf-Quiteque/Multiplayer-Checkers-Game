'use client';

import { createContext, useContext, useState } from 'react';

const BettingContext = createContext(undefined);

export function BettingProvider({ children }) {
  const [playerBalance, setPlayerBalance] = useState(10000); // Starting balance
  const [opponentBalance, setOpponentBalance] = useState(10000);
  const [currentBet, setCurrentBet] = useState(0);

  const placeBet = (amount) => {
    if (playerBalance >= amount && opponentBalance >= amount) {
      setPlayerBalance(b => b - amount);
      setOpponentBalance(b => b - amount);
      setCurrentBet(amount * 2); // Total pot is 2x the bet amount
    }
  };

  const distributeWinnings = (winner) => {
    const houseFee = currentBet * 0.10;
    const winnings = currentBet - houseFee;

    if (winner === 'player') {
      setPlayerBalance(b => b + winnings);
    } else {
      setOpponentBalance(b => b + winnings);
    }
    setCurrentBet(0);
  };

  const resetBetting = () => {
    setPlayerBalance(10000);
    setOpponentBalance(10000);
    setCurrentBet(0);
  };

  return (
    <BettingContext.Provider
      value={{
        playerBalance,
        opponentBalance,
        currentBet,
        placeBet,
        distributeWinnings,
        resetBetting
      }}
    >
      {children}
    </BettingContext.Provider>
  );
}

export function useBetting() {
  const context = useContext(BettingContext);
  if (context === undefined) {
    throw new Error('useBetting must be used within a BettingProvider');
  }
  return context;
}
