import React, { useEffect, useState, useRef } from 'react';

const PerformanceMonitor = () => {
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let animationId;
    
    const updateFPS = () => {
      const now = performance.now();
      frameCountRef.current++;
      
      // Atualiza FPS a cada segundo
      if (now - lastTimeRef.current >= 1000) {
        const actualFPS = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
        setFps(actualFPS);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      
      animationId = requestAnimationFrame(updateFPS);
    };
    
    updateFPS();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: '#00ff88',
      padding: '8px 12px',
      borderRadius: '4px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 10000,
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      FPS: {fps}
    </div>
  );
};

export default PerformanceMonitor; 