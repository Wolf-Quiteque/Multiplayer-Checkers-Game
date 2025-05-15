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
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { signInAnonymously } from 'firebase/auth';
import { initialBoard } from './game';

// Create a new game room
export const createGameRoom = async (betAmount = 0, gameType = 'checkers') => {
  // Ensure the user is signed in
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }

  const gameRoomsRef = collection(db, 'gameRooms');
  const newGameRoomRef = doc(gameRoomsRef);
  const gameRoomId = newGameRoomRef.id;

  const gameRoom = {
    blackPlayerId: auth.currentUser.uid,
    whitePlayerId: null,
    status: 'waiting',
    currentTurn: 'black',
    board: initialBoard,
    createdAt: serverTimestamp(),
    lastMoveAt: serverTimestamp(),
    winner: null,
    betAmount,
    gameType
  };

  await setDoc(newGameRoomRef, gameRoom);
  return gameRoomId;
};

// Join an existing game room
export const joinGameRoom = async (gameRoomId) => {
  // Ensure the user is signed in
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }

  const gameRoomRef = doc(db, 'gameRooms', gameRoomId);

  try {
    await updateDoc(gameRoomRef, {
      whitePlayerId: auth.currentUser.uid,
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
export const getAvailableGameRooms = async () => {
  const gameRoomsRef = collection(db, 'gameRooms');
  const q = query(
    gameRoomsRef,
    where('status', '==', 'waiting')
  );

  const querySnapshot = await getDocs(q);
  const rooms = [];

  querySnapshot.forEach((doc) => {
    rooms.push({ id: doc.id, ...doc.data() });
  });

  return rooms;
};

// Make a move
export const makeMove = async (
  gameRoomId,
  board,
  currentTurn,
  winner = null,
  tetrisState
) => {
  const gameRoomRef = doc(db, 'gameRooms', gameRoomId);

  const updateData = {
    board,
    currentTurn,
    lastMoveAt: serverTimestamp()
  };

  if (winner) {
    updateData.winner = winner;
    updateData.status = 'finished';
  }

  if (tetrisState) {
    const gameRoomDoc = await getDoc(gameRoomRef);
    const isBlackPlayer = auth.currentUser?.uid === gameRoomDoc.data()?.blackPlayerId;
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
  gameRoomId,
  callback
) => {
  const gameRoomRef = doc(db, 'gameRooms', gameRoomId);

  return onSnapshot(gameRoomRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      callback({ id: docSnapshot.id, ...data });
    }
  });
};

// Send a chat message
export const sendMessage = async (
  gameRoomId,
  text,
  senderName = 'Player'
) => {
  // Ensure the user is signed in
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }

  const messagesRef = collection(db, 'messages');
  const newMessageRef = doc(messagesRef);

  const message = {
    gameRoomId,
    senderId: auth.currentUser.uid,
    senderName,
    text,
    timestamp: serverTimestamp()
  };

  await setDoc(newMessageRef, message);
};

// Subscribe to chat messages
export const subscribeToMessages = (
  gameRoomId,
  callback
) => {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('gameRoomId', '==', gameRoomId)
  );

  return onSnapshot(q, (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });

    // Sort messages by timestamp
    messages.sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());

    callback(messages);
  });
};

// Leave/delete a game room
export const leaveGameRoom = async (gameRoomId) => {
  const gameRoomRef = doc(db, 'gameRooms', gameRoomId);
  await deleteDoc(gameRoomRef);
};
