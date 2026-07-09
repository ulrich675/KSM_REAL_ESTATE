'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeartButtonProps {
  bienId: string;
  likes: number;
  onLikeToggle?: () => void;
}

export default function HeartButton({ bienId, likes, onLikeToggle }: HeartButtonProps) {
  const { currentUser, toggleLike, clients } = useApp();
  
  const isLiked = currentUser?.role === 'client' 
    ? clients.find(c => c.id === currentUser.id)?.likedBienIds.includes(bienId) || false
    : false;

  const handleClick = async () => {
    if (!currentUser) {
      alert('Veuillez vous connecter pour liker ce bien');
      return;
    }
    if (currentUser.role !== 'client') {
      alert('Seuls les clients peuvent liker les biens');
      return;
    }
    await toggleLike(bienId);
    if (onLikeToggle) onLikeToggle();
  };

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '6px 12px',
        borderRadius: 'var(--radius-full)',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!isLiked) e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <Heart
        size={20}
        style={{
          fill: isLiked ? '#ef4444' : 'none',
          color: isLiked ? '#ef4444' : 'var(--text-gray)',
          transition: 'all 0.2s',
        }}
      />
      <span style={{ 
        color: 'var(--text-gray)',
        fontSize: '14px',
        fontWeight: '500',
      }}>
        {likes}
      </span>
    </button>
  );
}
