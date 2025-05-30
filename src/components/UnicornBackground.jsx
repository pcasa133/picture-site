import React, { useEffect } from 'react';

export default function UnicornBackground() {
  useEffect(() => {
    // Carrega o script do UnicornStudio se ainda não foi carregado
    if (!window.UnicornStudio) {
      window.UnicornStudio = { isInitialized: false };
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.25/dist/unicornStudio.umd.js';
      script.onload = function() {
        if (!window.UnicornStudio.isInitialized) {
          window.UnicornStudio.init();
          window.UnicornStudio.isInitialized = true;
        }
      };
      (document.head || document.body).appendChild(script);
    }
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        overflow: 'hidden'
      }}
    >
      <div 
        data-us-project="hPzzonM2KfuiNyuBi8mX" 
        style={{
          width: '100vw', 
          height: '100vh',
          minWidth: '1440px',
          minHeight: '900px'
        }}
      />
    </div>
  );
} 