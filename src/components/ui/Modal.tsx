'use client';
import React from 'react';

export default function Modal({ open, onClose, children }: { open: boolean, onClose: () => void, children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative bg-gray-900 rounded-xl shadow-xl max-w-7xl w-full p-6 pt-8 max-h-[95vh] overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
} 