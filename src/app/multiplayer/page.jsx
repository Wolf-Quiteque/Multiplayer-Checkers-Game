'use client';

import { MultiplayerLobby } from '@/components/game/MultiplayerLobby';
import Link from 'next/link';

export default function MultiplayerLobbyPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 order-2 sm:order-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Home</span>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold order-1 sm:order-2">Multiplayer Lobby</h1>
        <div className="w-36 hidden sm:block order-3"></div> {/* Spacer for centering */}
      </div>

      <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <p className="font-medium text-blue-800">Online Game Mode</p>
        </div>
        <p className="text-gray-700">Create a new game or join an existing one to play checkers online with other players.</p>
      </div>

      <MultiplayerLobby />
    </div>
  );
}
