import React, { useEffect, useState, useRef } from 'react';
import { useThree } from '@react-three/fiber';

const PerformanceMonitor = () => {
  const [fps, setFps] = useState(0);
  const [memoryInfo, setMemoryInfo] = useState({});
  const [webglInfo, setWebglInfo] = useState({});
  const [deviceInfo, setDeviceInfo] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  
  // Hook do Three.js para acessar o renderer
  const { gl } = useThree();

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
      if (!gl) return;
      
      const info = {};
      const renderer = gl;
      
      // Informações do renderer Three.js
      if (renderer.info) {
        info.geometries = renderer.info.memory.geometries;
        info.textures = renderer.info.memory.textures;
        info.drawCalls = renderer.info.render.calls;
        info.triangles = renderer.info.render.triangles;
        info.points = renderer.info.render.points;
      }
      
      // Extensões WebGL para memória de vídeo
      const ext = renderer.getContext().getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        info.renderer = renderer.getContext().getParameter(ext.UNMASKED_RENDERER_WEBGL);
        info.vendor = renderer.getContext().getParameter(ext.UNMASKED_VENDOR_WEBGL);
      }
      
      // Informações de contexto WebGL
      const context = renderer.getContext();
      info.maxTextures = context.getParameter(context.MAX_TEXTURE_IMAGE_UNITS);
      info.maxTextureSize = context.getParameter(context.MAX_TEXTURE_SIZE);
      info.maxViewport = context.getParameter(context.MAX_VIEWPORT_DIMS);
      
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
  }, [gl]);

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
      
      {webglInfo.textures !== undefined && (
        <div style={{ color: '#ff6600', fontSize: '10px' }}>
          GPU: {webglInfo.textures}tex {webglInfo.geometries}geo
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
            {webglInfo.drawCalls !== undefined && <div>Draw Calls: {webglInfo.drawCalls}</div>}
            {webglInfo.triangles !== undefined && <div>Triangles: {webglInfo.triangles.toLocaleString()}</div>}
            {webglInfo.textures !== undefined && <div>Textures: {webglInfo.textures}</div>}
            {webglInfo.geometries !== undefined && <div>Geometries: {webglInfo.geometries}</div>}
            {webglInfo.maxTextureSize && <div>Max Texture: {webglInfo.maxTextureSize}px</div>}
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