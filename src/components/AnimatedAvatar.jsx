import React from "react";

export default function AnimatedAvatar({ size = 32 }) {
  return (
    <div 
      className="animated-avatar"
      style={{ 
        width: size, 
        height: size,
        borderRadius: '50%',
        background: '#2a2a2a', // Círculo cinza escuro
        flexShrink: 0
      }}
    />
  );
} 