import React, { useEffect, useState, useRef } from 'react';

const PerformanceMonitor = () => {
  const [fps, setFps] = useState(0);
  const [memoryInfo, setMemoryInfo] = useState({});
  const [webglInfo, setWebglInfo] = useState({});
  const [deviceInfo, setDeviceInfo] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let animationId;
    
    const updateMetrics = () => {
      const now = performance.now();
      frameCountRef.current++;
      
      // Atualiza FPS a cada segundo
      if (now - lastTimeRef.current >= 1000) {
        const actualFPS = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
        setFps(actualFPS);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
        
        // Atualiza informações de memória e WebGL
        updateMemoryInfo();
        updateWebGLInfo();
      }
      
      animationId = requestAnimationFrame(updateMetrics);
    };
    
    const updateMemoryInfo = () => {
      const memory = {};
      
      // Memória JavaScript (Chrome/Edge)
      if (performance.memory) {
        memory.jsUsed = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        memory.jsTotal = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024);
        memory.jsLimit = Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024);
      }
      
      // Memória do dispositivo (se disponível)
      if (navigator.deviceMemory) {
        memory.deviceRAM = navigator.deviceMemory;
      }
      
      setMemoryInfo(memory);
    };
    
    const updateWebGLInfo = () => {
      const info = {};
      
      try {
        // Criar um contexto WebGL temporário para obter informações
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (gl) {
          // Extensões WebGL para informações do renderer
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            info.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            info.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          }
          
          // Informações de contexto WebGL
          info.maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
          info.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
          info.maxViewport = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
          info.webglVersion = gl.getParameter(gl.VERSION);
          info.shadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
          
          // Limpeza
          canvas.remove();
        }
        
        // Tentar acessar informações do Three.js se disponível globalmente
        if (window.__THREE_DEVTOOLS__) {
          const rendererInfo = window.__THREE_DEVTOOLS__.renderer;
          if (rendererInfo) {
            info.threeRenderer = rendererInfo;
          }
        }
      } catch (error) {
        console.warn('Could not get WebGL info:', error);
      }
      
      setWebglInfo(info);
    };
    
    const updateDeviceInfo = () => {
      const device = {};
      
      // Informações do dispositivo
      device.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      device.cores = navigator.hardwareConcurrency || 'N/A';
      device.connection = navigator.connection ? navigator.connection.effectiveType : 'N/A';
      device.pixelRatio = window.devicePixelRatio || 1;
      device.screenSize = `${screen.width}x${screen.height}`;
      device.viewport = `${window.innerWidth}x${window.innerHeight}`;
      
      setDeviceInfo(device);
    };
    
    updateDeviceInfo();
    updateMetrics();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  const getPerformanceColor = () => {
    if (fps >= 50) return '#00ff88'; // Verde - Ótimo
    if (fps >= 30) return '#ffaa00'; // Laranja - Razoável
    return '#ff4444'; // Vermelho - Ruim
  };

  const formatBytes = (bytes) => {
    if (!bytes) return 'N/A';
    return `${bytes}MB`;
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.9)',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: '6px',
        fontFamily: 'monospace',
        fontSize: '11px',
        zIndex: 10000,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        minWidth: '120px',
        cursor: 'pointer'
      }}
      onClick={() => setShowDetails(!showDetails)}
    >
      <div style={{ color: getPerformanceColor(), fontWeight: 'bold', marginBottom: '4px' }}>
        FPS: {fps}
      </div>
      
      {memoryInfo.jsUsed && (
        <div style={{ color: '#00aaff', fontSize: '10px' }}>
          JS: {formatBytes(memoryInfo.jsUsed)}/{formatBytes(memoryInfo.jsTotal)}
        </div>
      )}
      
      {webglInfo.maxTextureSize && (
        <div style={{ color: '#ff6600', fontSize: '10px' }}>
          GPU: {webglInfo.maxTextureSize}px max
        </div>
      )}
      
      {deviceInfo.isMobile && (
        <div style={{ color: '#ffaa00', fontSize: '10px' }}>
          📱 Mobile
        </div>
      )}
      
      {showDetails && (
        <div style={{ 
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '4px',
          background: 'rgba(0, 0, 0, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '6px',
          padding: '12px',
          minWidth: '280px',
          fontSize: '10px',
          lineHeight: '1.4'
        }}>
          <div style={{ color: '#00ff88', fontWeight: 'bold', marginBottom: '8px' }}>
            📊 Performance Details
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <div style={{ color: '#00aaff', fontWeight: 'bold' }}>💾 Memory:</div>
            {memoryInfo.jsUsed && <div>JS Heap: {formatBytes(memoryInfo.jsUsed)}/{formatBytes(memoryInfo.jsLimit)}</div>}
            {memoryInfo.deviceRAM && <div>Device RAM: {memoryInfo.deviceRAM}GB</div>}
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <div style={{ color: '#ff6600', fontWeight: 'bold' }}>🎮 WebGL:</div>
            {webglInfo.renderer && <div>GPU: {webglInfo.renderer.substring(0, 40)}...</div>}
            {webglInfo.maxTextureSize && <div>Max Texture: {webglInfo.maxTextureSize}px</div>}
            {webglInfo.maxTextures && <div>Max Texture Units: {webglInfo.maxTextures}</div>}
            {webglInfo.webglVersion && <div>WebGL: {webglInfo.webglVersion.substring(0, 25)}...</div>}
          </div>
          
          <div>
            <div style={{ color: '#ffaa00', fontWeight: 'bold' }}>📱 Device:</div>
            <div>Type: {deviceInfo.isMobile ? 'Mobile' : 'Desktop'}</div>
            {deviceInfo.cores !== 'N/A' && <div>CPU Cores: {deviceInfo.cores}</div>}
            <div>Pixel Ratio: {deviceInfo.pixelRatio}x</div>
            <div>Screen: {deviceInfo.screenSize}</div>
            <div>Viewport: {deviceInfo.viewport}</div>
            {deviceInfo.connection !== 'N/A' && <div>Connection: {deviceInfo.connection}</div>}
          </div>
          
          <div style={{ marginTop: '8px', fontSize: '9px', color: '#888' }}>
            Click to toggle details
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor; 