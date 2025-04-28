'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';

export function MultiplayerLobby() {
  const router = useRouter();
  const [betAmount, setBetAmount] = useState(100);
  const [customBet, setCustomBet] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const {
    availableRooms,
    loading,
    error,
    createRoom,
    joinRoom,
    refreshRooms
  } = useMultiplayerGame();

  // Create a new game room and redirect to it
  const [gameType, setGameType] = useState<'checkers' | 'tetris'>('checkers');

  const handleCreateRoom = async () => {
    const bet = customBet ? parseInt(customBet) : betAmount;
    const roomId = await createRoom(bet, gameType);
    if (roomId) {
      router.push(`/multiplayer/${roomId}`);
    }
  };

  // Join an existing game room
  const handleJoinRoom = async () => {
    if (!selectedRoomId) return;
    
    const success = await joinRoom(selectedRoomId);
    if (success) {
      router.push(`/multiplayer/${selectedRoomId}`);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border border-blue-100 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <CardTitle>Create New Game</CardTitle>
              <CardDescription>Start a new game and wait for an opponent to join</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Bet Amount ($)</label>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Game Type</label>
                  <Select defaultValue="checkers">
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select game type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checkers">Checkers</SelectItem>
                      <SelectItem value="tetris">Tetris</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Select
                value={customBet ? 'custom' : betAmount.toString()}
                onValueChange={(value: string) => {
                  if (value === 'custom') {
                    setBetAmount(0);
                  } else {
                    setBetAmount(parseInt(value));
                    setCustomBet('');
                  }
                }}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select an amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Free Game (No Bet)</SelectItem>
                  <SelectItem value="100">$100</SelectItem>
                  <SelectItem value="500">$500</SelectItem>
                  <SelectItem value="1000">$1,000</SelectItem>
                  <SelectItem value="2000">$2,000</SelectItem>
                  <SelectItem value="custom">Custom Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {customBet || betAmount === 0 ? (
              <div>
                <label className="block text-sm font-medium mb-2">Custom Amount</label>
                <Input 
                  type="number" 
                  placeholder="Enter amount" 
                  value={customBet}
                  onChange={e => setCustomBet(e.target.value)}
                  className="h-12"
                />
              </div>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t pt-4">
          <Button 
            onClick={handleCreateRoom} 
            className="w-full h-12 text-lg font-medium" 
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Game'}
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="border border-green-100 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <div>
              <CardTitle>Join Game</CardTitle>
              <CardDescription>Join an existing game from the list below</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Available Games</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshRooms} 
                disabled={loading}
                className="flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-md border border-red-100">
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            {availableRooms.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md border border-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p>No games available to join</p>
                <p className="text-sm mt-1">Create your own game or refresh the list</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto touch-manipulation p-1">
                {availableRooms.map(room => (
                  <div 
                    key={room.id} 
                    className={`
                      p-3 border rounded-md cursor-pointer transition-all duration-200
                      ${selectedRoomId === room.id ? 'border-green-500 bg-green-50 shadow-md transform scale-[1.02]' : 'hover:bg-gray-50 active:bg-gray-100'}
                      touch-manipulation active:scale-[0.98]
                    `}
                    onClick={() => setSelectedRoomId(room.id)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Game #{room.id.substring(0, 8)}</span>
                      <span className={room.betAmount > 0 ? 'text-green-600 font-semibold px-2 py-1 bg-green-50 rounded-full text-sm' : 'text-gray-400 text-sm'}>
                        {room.betAmount > 0 ? `$${room.betAmount.toLocaleString()} bet` : 'Free Game'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Created {room.createdAt?.toDate().toLocaleTimeString() || 'recently'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t pt-4">
          <Button 
            onClick={handleJoinRoom} 
            className="w-full h-12 text-lg font-medium bg-green-600 hover:bg-green-700" 
            disabled={loading || !selectedRoomId}
          >
            {loading ? 'Joining...' : 'Join Selected Game'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
