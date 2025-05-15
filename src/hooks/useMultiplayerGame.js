'use client';

import { useState, useEffect, useCallback } from 'react';
import { getValidMoves, checkWinCondition } from '../lib/game';
import { useBetting } from '@/context/BettingContext';
import { auth } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import {
  createGameRoom,
  joinGameRoom,
  makeMove,
  subscribeToGameRoom,
  subscribeToMessages,
  sendMessage,
  leaveGameRoom,
  getAvailableGameRooms
} from '../lib/gameRoom';

export const useMultiplayerGame = (gameRoomId) => {
  const [gameRoom, setGameRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [playerColor, setPlayerColor] = useState(null);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');
  const { placeBet, distributeWinnings } = useBetting();

  // Sign in anonymously if not already signed in
  useEffect(() => {
    const signIn = async () => {
      if (!auth.currentUser) {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          setError('Failed to sign in anonymously. Please try again.');
          console.error(err);
        }
      }
    };

    signIn();
  }, []);

  // Load existing game room or available rooms
  useEffect(() => {
    const loadGameData = async () => {
      setLoading(true);
      try {
        if (gameRoomId) {
          // Subscribe to specific game room
          const unsubscribe = subscribeToGameRoom(gameRoomId, (room) => {
            setGameRoom(room);

            // Determine player color based on user ID
            if (auth.currentUser) {
              if (room.blackPlayerId === auth.currentUser.uid) {
                setPlayerColor('black');
              } else if (room.whitePlayerId === auth.currentUser.uid) {
                setPlayerColor('white');
              }
            }

            setLoading(false);
          });

          return () => unsubscribe();
        } else {
          // Get available rooms
          const rooms = await getAvailableGameRooms();
          setAvailableRooms(rooms);
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to load game data. Please try again.');
        console.error(err);
        setLoading(false);
      }
    };

    loadGameData();
  }, [gameRoomId]);

  // Subscribe to chat messages
  useEffect(() => {
    if (gameRoomId) {
      const unsubscribe = subscribeToMessages(gameRoomId, (newMessages) => {
        setMessages(newMessages);
      });

      return () => unsubscribe();
    }
  }, [gameRoomId]);

  // Create a new game room
  const createRoom = async (betAmount = 0, gameType = 'checkers') => {
    setLoading(true);
    try {
      const roomId = await createGameRoom(betAmount, gameType);
      setPlayerColor('black');
      if (betAmount > 0) {
        placeBet(betAmount);
      }
      return roomId;
    } catch (err) {
      setError('Failed to create game room. Please try again.');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Join an existing game room
  const joinRoom = async (roomId) => {
    setLoading(true);
    try {
      const success = await joinGameRoom(roomId);
      if (success) {
        setPlayerColor('white');
        return true;
      }
      setError('Failed to join game room. It may be full or no longer available.');
      return false;
    } catch (err) {
      setError('Failed to join game room. Please try again.');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handle clicking on a square for moves
  const handleSquareClick = async (row, col) => {
    if (!gameRoom || !playerColor || playerColor !== gameRoom.currentTurn) {
      return; // Not this player's turn
    }

    const clickedSquare = gameRoom.board[row][col];

    // If no piece selected and clicked square has current player's piece
    if (!selectedPiece && clickedSquare?.color === playerColor) {
      setSelectedPiece({ row, col });
      setValidMoves(getValidMoves(row, col, gameRoom.board));
      return;
    }

    // If piece is already selected
    if (selectedPiece) {
      // If clicking same piece, deselect it
      if (selectedPiece.row === row && selectedPiece.col === col) {
        setSelectedPiece(null);
        setValidMoves([]);
        return;
      }

      // If valid move, move the piece
      const isValidMove = validMoves.some(move =>
        move.row === row && move.col === col
      );

      if (isValidMove) {
        // Deep clone the board
        const newBoard = JSON.parse(JSON.stringify(gameRoom.board));
        const piece = newBoard[selectedPiece.row][selectedPiece.col];

        // Check if this is a capture move
        const isCapture = Math.abs(row - selectedPiece.row) === 2;

        // Move the piece
        newBoard[selectedPiece.row][selectedPiece.col] = null;
        newBoard[row][col] = piece;

        // Remove captured piece if this was a capture
        if (isCapture) {
          const jumpedRow = (selectedPiece.row + row) / 2;
          const jumpedCol = (selectedPiece.col + col) / 2;
          newBoard[jumpedRow][jumpedCol] = null;
        }

        // Check for king promotion
        if ((piece?.color === 'black' && row === 7) ||
            (piece?.color === 'white' && row === 0)) {
          newBoard[row][col] = { ...piece, type: 'king' };
        }

        // Check for win condition
        const winner = checkWinCondition(newBoard);

        // Update the game state in Firestore
        const nextTurn = gameRoom.currentTurn === 'black' ? 'white' : 'black';
        await makeMove(gameRoom.id, newBoard, nextTurn, winner);

        setSelectedPiece(null);
        setValidMoves([]);
      }
    }
  };

  // Send a chat message
  const sendChatMessage = async (text) => {
    if (!gameRoomId || !text.trim()) return;

    try {
      await sendMessage(gameRoomId, text, `Player (${playerColor})`);
      setNewMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Leave the game
  const leave = async () => {
    if (gameRoom) {
      try {
        await leaveGameRoom(gameRoom.id);
      } catch (err) {
        console.error('Error leaving game:', err);
      }
    }
  };

  // Refresh available rooms list
  const refreshRooms = async () => {
    setLoading(true);
    try {
      const rooms = await getAvailableGameRooms();
      setAvailableRooms(rooms);
    } catch (err) {
      setError('Failed to fetch available rooms. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    gameRoom,
    playerColor,
    selectedPiece,
    validMoves,
    messages,
    newMessageText,
    setNewMessageText,
    availableRooms,
    loading,
    error,
    createRoom,
    joinRoom,
    handleSquareClick,
    sendChatMessage,
    leave,
    refreshRooms
  };
};
