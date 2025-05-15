'use client';

import React from 'react';
import { cn } from '@/lib/utils';


export const Square = ({
  isBlack,
  isSelected,
  isValidMove,
  onClick,
  children
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center justify-center relative transition-all duration-200',
        isBlack ? 'bg-gray-800' : 'bg-gray-100',
        isSelected && 'ring-4 ring-yellow-400 z-10',
        isValidMove && 'ring-2 ring-green-400 hover:bg-opacity-80 hover:bg-green-100 z-5',
        'active:scale-95 touch-manipulation'
      )}
    >
      {isValidMove && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-1/4 h-1/4 rounded-full bg-green-400 bg-opacity-30"></div>
        </div>
      )}
      {children}
    </div>
  );
};
