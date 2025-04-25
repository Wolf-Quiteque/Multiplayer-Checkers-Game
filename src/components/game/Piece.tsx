'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { Piece as PieceType } from '@/types/game';

type PieceProps = {
  piece: PieceType;
}

export const Piece = ({ piece }: PieceProps) => {
  const isKing = piece.type === 'king';
  const isBlack = piece.color === 'black';

  return (
    <div className="p-1 w-full h-full flex items-center justify-center">
      <div className={cn(
        'w-4/5 h-4/5 rounded-full flex items-center justify-center',
        'shadow-md transform transition-all duration-300',
        'hover:scale-105 active:scale-95',
        isBlack ? 'bg-gray-900 border border-gray-700' : 'bg-red-600 border border-red-400',
        isKing && 'border-2 border-yellow-400 animate-pulse'
      )}>
        {isKing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1/3 h-1/3 bg-yellow-400 rounded-full opacity-40"></div>
          </div>
        )}
        {isKing && (
          <span className="text-xs font-bold text-white z-10">K</span>
        )}
      </div>
    </div>
  );
};
