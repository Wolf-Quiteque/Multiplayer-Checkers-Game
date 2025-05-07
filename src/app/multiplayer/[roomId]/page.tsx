'use client';

import { MultiplayerGame } from '@/components/game/MultiplayerGame';
import Link from 'next/link';
export default async function Page({ params }: { params: { roomId: string } }) {
  const { roomId } = params;
  

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <Link href="/multiplayer" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 order-2 sm:order-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Lobby</span>
        </Link>
        <div className="order-1 sm:order-2 text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Multiplayer Game</h1>
          <p className="text-sm text-gray-500">Room ID: {roomId.substring(0, 8)}</p>
        </div>
        <div className="w-36 hidden sm:block order-3"></div> {/* Spacer for centering */}
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
          <p className="font-medium text-blue-800">Online Match</p>
        </div>
      </div>
      
      <MultiplayerGame gameRoomId={roomId} />
    </div>
  );
}
