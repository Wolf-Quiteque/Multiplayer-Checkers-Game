'use client';

import { useParams } from 'next/navigation';
import MultiplayerTetris from '@/components/game/MultiplayerTetris';
import { BettingProvider } from '@/context/BettingContext';

export default function TetrisMultiplayerPage() {
  const params = useParams();
  const roomId = params.roomId;

  return (
    <BettingProvider>
      <MultiplayerTetris roomId={roomId} />
    </BettingProvider>
  );
}
