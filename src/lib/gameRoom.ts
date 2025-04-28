import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  getDocs, 
  getDoc,
  query, 
  where, 
  serverTimestamp, 
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { signInAnonymously } from 'firebase/auth';
import { Board, PieceColor } from '@/types/game';
import { initialBoard } from './game';

// Game room types
export interface GameRoom {
  id: string;
  blackPlayerId: string;
  whitePlayerId: string | null;
  status: 'waiting' | 'playing' | 'finished';
  currentTurn: PieceColor;
  board: Board;
  createdAt: Timestamp;
  lastMoveAt: Timestamp;
  winner: PieceColor | null;
  betAmount: number;
  gameType: 'checkers' | 'tetris';
  
  // Tetris-specific fields
  blackPlayerBoard?: number[][];
  whitePlayerBoard?: number[][];
  blackPlayerScore?: number;
  whitePlayerScore?: number;
  currentPiece?: {
    shape: number[][];
    position: {x: number, y: number};
  };
}

export interface Message {
  id: string;
  gameRoomId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Timestamp;
}

// Create a new game room
export const createGameRoom = async (betAmount: number = 0, gameType: 'checkers' | 'tetris' = 'checkers'): Promise<string> => {
  // Ensure the user is signed in
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }

  const gameRoomsRef = collection(db, 'gameRooms');
  const newGameRoomRef = doc(gameRoomsRef);
  const gameRoomId = newGameRoomRef.id;

  const gameRoom: Omit<GameRoom, 'id'> = {
    blackPlayerId: auth.currentUser!.uid,
    whitePlayerId: null,
    status: 'waiting',
    currentTurn: 'black',
    board: initialBoard,
    createdAt: serverTimestamp() as Timestamp,
    lastMoveAt: serverTimestamp() as Timestamp,
    winner: null,
    betAmount,
    gameType
  };

  await setDoc(newGameRoomRef, gameRoom);
  return gameRoomId;
};

// Join an existing game room
export const joinGameRoom = async (gameRoomId: string): Promise<boolean> => {
  // Ensure the user is signed in
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }

  const gameRoomRef = doc(db, 'gameRooms', gameRoomId);
  
  try {
    await updateDoc(gameRoomRef, {
      whitePlayerId: auth.currentUser!.uid,
      status: 'playing',
      lastMoveAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error joining game room:', error);
    return false;
  }
};

// Get available game rooms
export const getAvailableGameRooms = async (): Promise<GameRoom[]> => {
  const gameRoomsRef = collection(db, 'gameRooms');
  const q = query(
    gameRoomsRef, 
    where('status', '==', 'waiting')
  );
  
  const querySnapshot = await getDocs(q);
  const rooms: GameRoom[] = [];
  
  querySnapshot.forEach((doc) => {
    rooms.push({ id: doc.id, ...doc.data() } as GameRoom);
  });
  
  return rooms;
};

// Make a move
export const makeMove = async (
  gameRoomId: string, 
  board: Board, 
  currentTurn: PieceColor,
  winner: PieceColor | null = null,
  tetrisState?: {
    playerBoard: number[][];
    playerScore: number;
    currentPiece?: {
      shape: number[][];
      position: {x: number, y: number};
    };
  }
): Promise<void> => {
  const gameRoomRef = doc(db, 'gameRooms', gameRoomId);
  
  const updateData: any = {
    board,
    currentTurn,
    lastMoveAt: serverTimestamp()
  };
  
  if (winner) {
    updateData.winner = winner;
    updateData.status = 'finished';
  }

  if (tetrisState) {
    const isBlackPlayer = auth.currentUser?.uid === (await getDoc(gameRoomRef)).data()?.blackPlayerId;
    if (isBlackPlayer) {
      updateData.blackPlayerBoard = tetrisState.playerBoard;
      updateData.blackPlayerScore = tetrisState.playerScore;
    } else {
      updateData.whitePlayerBoard = tetrisState.playerBoard;
      updateData.whitePlayerScore = tetrisState.playerScore;
    }
    if (tetrisState.currentPiece) {
      updateData.currentPiece = tetrisState.currentPiece;
    }
  }
  
  await updateDoc(gameRoomRef, updateData);
};

// Subscribe to game room updates
export const subscribeToGameRoom = (
  gameRoomId: string, 
  callback: (gameRoom: GameRoom) => void
) => {
  const gameRoomRef = doc(db, 'gameRooms', gameRoomId);
  
  return onSnapshot(gameRoomRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      callback({ id: docSnapshot.id, ...data } as GameRoom);
    }
  });
};

// Send a chat message
export const sendMessage = async (
  gameRoomId: string, 
  text: string,
  senderName: string = 'Player'
): Promise<void> => {
  // Ensure the user is signed in
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }

  const messagesRef = collection(db, 'messages');
  const newMessageRef = doc(messagesRef);
  
  const message: Omit<Message, 'id'> = {
    gameRoomId,
    senderId: auth.currentUser!.uid,
    senderName,
    text,
    timestamp: serverTimestamp() as Timestamp
  };
  
  await setDoc(newMessageRef, message);
};

// Subscribe to chat messages
export const subscribeToMessages = (
  gameRoomId: string, 
  callback: (messages: Message[]) => void
) => {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef, 
    where('gameRoomId', '==', gameRoomId)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const messages: Message[] = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as Message);
    });
    
    // Sort messages by timestamp
    messages.sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());
    
    callback(messages);
  });
};

// Leave/delete a game room
export const leaveGameRoom = async (gameRoomId: string): Promise<void> => {
  const gameRoomRef = doc(db, 'gameRooms', gameRoomId);
  await deleteDoc(gameRoomRef);
};
