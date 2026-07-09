'use client';

import React from 'react';

interface DateValidatorProps {
  value: string;
  onChange: (date: string) => void;
  onError?: (error: string | null) => void;
}

export default function DateValidator({ value, onChange, onError }: DateValidatorProps) {
  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    
    if (newDate && newDate < today) {
      if (onError) onError('La date ne peut pas être dans le passé');
      onChange(newDate);
      return;
    }
    
    if (onError) onError(null);
    onChange(newDate);
  };

  return (
    <input
      type="date"
      min={today}
      value={value}
      onChange={handleChange}
      className="form-input"
      style={{
        width: '100%',
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--text-white)',
      }}
    />
  );
}
