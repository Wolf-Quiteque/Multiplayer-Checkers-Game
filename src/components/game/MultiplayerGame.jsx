'use client';

import { useEffect } from 'react';
import { BettingPanel } from './BettingPanel';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Piece } from './Piece';
import { auth } from '@/lib/firebase';


export function MultiplayerGame({ gameRoomId }) {
  const {
    gameRoom,
    playerColor,
    selectedPiece,
    validMoves,
    messages,
    newMessageText,
    setNewMessageText,
    handleSquareClick,
    sendChatMessage,
    leave,
    loading,
    error
  } = useMultiplayerGame(gameRoomId);

  useEffect(() => {
    // Cleanup when component unmounts
    return () => {
      leave();
    };
  }, [leave]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-64">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium text-gray-700">Loading game...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg shadow-md max-w-md mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-600 mb-4 font-medium">{error}</p>
        <Link href="/multiplayer">
          <Button variant="outline" className="w-full">Back to Lobby</Button>
        </Link>
      </div>
    );
  }

  if (!gameRoom) {
    return (
      <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg shadow-md max-w-md mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-700 mb-4">Game room not found or has been closed.</p>
        <Link href="/multiplayer">
          <Button variant="outline" className="w-full">Back to Lobby</Button>
        </Link>
      </div>
    );
  }

  // Game state
  const isWaiting = gameRoom.status === 'waiting';
  const isPlaying = gameRoom.status === 'playing';
  const isFinished = gameRoom.status === 'finished';
  const isPlayerTurn = gameRoom.currentTurn === playerColor;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Game Info & Chat */}
      <div className="order-2 lg:order-1">
        {/* Game Status Panel */}
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
            <h2 className="text-xl font-bold">Game Status</h2>
          </div>

          <div className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isWaiting ? 'bg-yellow-100 text-yellow-800' :
                  isPlaying ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {isWaiting ? 'Waiting for opponent' : isPlaying ? 'In Progress' : 'Finished'}
                </span>
              </div>

              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Your Color:</span>
                <div className="flex items-center gap-2">
                  {playerColor && (
                    <div className={`w-4 h-4 rounded-full ${playerColor === 'black' ? 'bg-gray-900' : 'bg-red-500'}`}></div>
                  )}
                  <span className="font-medium capitalize">{playerColor || 'Spectator'}</span>
                </div>
              </div>

              <div className={`flex justify-between items-center p-2 ${isPlayerTurn ? 'bg-blue-50' : 'bg-gray-50'} rounded ${isPlayerTurn && 'animate-pulse'}`}>
                <span className="text-gray-600">Current Turn:</span>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${gameRoom.currentTurn === 'black' ? 'bg-gray-900' : 'bg-red-500'}`}></div>
                  <span className={`font-medium capitalize ${isPlayerTurn ? 'text-blue-700' : ''}`}>
                    {gameRoom.currentTurn}
                    {isPlayerTurn && ' (Your Turn)'}
                  </span>
                </div>
              </div>

              {gameRoom.betAmount > 0 && (
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-gray-600">Bet Amount:</span>
                  <span className="font-bold text-green-600">${gameRoom.betAmount.toLocaleString()}</span>
                </div>
              )}

              {gameRoom.winner && (
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                  <span className="text-gray-600">Winner:</span>
                  <span className="font-bold text-yellow-600 capitalize">{gameRoom.winner}</span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <Link href="/multiplayer">
                <Button variant="outline" className="w-full">Leave Game</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden h-[calc(100vh-520px)] min-h-[320px] flex flex-col">
          <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-4">
            <h2 className="text-xl font-bold">Game Chat</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>No messages yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((msg) => {
                  const isCurrentUser = msg.senderId === (auth?.currentUser?.uid || '');
                  return (
                    <div
                      key={msg.id}
                      className={`p-2 rounded-lg max-w-[80%] ${
                        isCurrentUser
                          ? 'ml-auto bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="text-xs opacity-75 mb-1">{msg.senderName}</div>
                      <p>{msg.text}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-3 border-t bg-white">
            <div className="flex gap-2">
              <Input
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage(newMessageText)}
              />
              <Button
                onClick={() => sendChatMessage(newMessageText)}
                disabled={!newMessageText.trim()}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Center Column: Game Board */}
      <div className="lg:col-span-2 order-1 lg:order-2">
        {/* Multiplayer Board */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-8 gap-0 w-full max-w-[95vw] md:max-w-[70vw] lg:max-w-[600px] aspect-square border-2 border-gray-800 mx-auto rounded-md overflow-hidden shadow-lg"
               style={{minWidth: '280px', minHeight: '280px'}}>
            {gameRoom.board.map((row, rowIndex) => (
              row.map((square, colIndex) => {
                const isBlack = (rowIndex + colIndex) % 2 === 1;
                const isSelected = selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex;
                const isValidMove = validMoves.some(move =>
                  move.row === rowIndex && move.col === colIndex
                );

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleSquareClick(rowIndex, colIndex)}
                    className={`
                      flex items-center justify-center relative transition-all duration-200
                      ${isBlack ? 'bg-gray-800' : 'bg-gray-100'}
                      ${isSelected ? 'ring-4 ring-yellow-400 z-10' : ''}
                      ${isValidMove ? 'ring-2 ring-green-400 hover:bg-green-100 hover:bg-opacity-30 z-5' : ''}
                      ${isPlayerTurn ? 'cursor-pointer' : 'cursor-not-allowed'}
                      active:scale-95 touch-manipulation
                    `}
                  >
                    {isValidMove && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-1/4 h-1/4 rounded-full bg-green-400 bg-opacity-30"></div>
                      </div>
                    )}

                    {square && (
                      <div className="p-1 w-full h-full flex items-center justify-center">
                        <div className={`
                          w-4/5 h-4/5 rounded-full flex items-center justify-center
                          shadow-md transform transition-all duration-300
                          hover:scale-105 active:scale-95
                          ${square.color === 'black' ? 'bg-gray-900 border border-gray-700' : 'bg-red-600 border border-red-400'}
                          ${square.type === 'king' ? 'border-2 border-yellow-400' : ''}
                          ${square.type === 'king' ? 'animate-pulse' : ''}
                        `}>
                          {square.type === 'king' && (
                            <>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-1/3 h-1/3 bg-yellow-400 rounded-full opacity-40"></div>
                              </div>
                              <span className="text-xs font-bold text-white z-10">K</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ))}
          </div>
        </div>

        {/* Game Instructions/Information */}
        {isWaiting && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-yellow-800">Waiting for an opponent</h3>
                <p className="text-sm text-yellow-700">Share this game link with a friend to start playing</p>
              </div>
            </div>
          </div>
        )}

        {isPlaying && isPlayerTurn && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-green-800">Your Turn</h3>
                <p className="text-sm text-green-700">Select a piece to move</p>
              </div>
            </div>
          </div>
        )}

        {isPlaying && !isPlayerTurn && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-blue-800">Opponent's Turn</h3>
                <p className="text-sm text-blue-700">Waiting for your opponent to make a move</p>
              </div>
            </div>
          </div>
        )}

        {isFinished && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-purple-800">Game Finished</h3>
                <p className="text-sm text-purple-700">
                  {gameRoom.winner === playerColor ? 'Congratulations! You won!' : 'Better luck next time!'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
