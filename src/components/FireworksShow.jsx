import React, { useEffect, useRef } from "react";

const FireworksShow = ({ 
  children,
  isActive = false,
  onComplete
}) => {
  const canvasRef = useRef(null);
  const fireworksRef = useRef([]);
  const animationFrameRef = useRef(0);
  const lastFireworkTimeRef = useRef(Date.now());

  const colors = [
    "#9b87f5",
    "#D946EF", 
    "#F97316", 
    "#0EA5E9", 
    "#ea384c", 
    "#10B981", 
    "#FCD34D", 
  ];

  const createFirework = (x, y, targetY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const startX = x || Math.random() * canvas.width;
    const startY = canvas.height;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const angle = (Math.random() * Math.PI) / 2 - Math.PI / 4;
    const velocity = 6 + Math.random() * 4;

    const target = targetY || canvas.height * (0.1 + Math.random() * 0.4);

    const firework = {
      x: startX,
      y: startY,
      color,
      velocity: {
        x: Math.sin(angle) * velocity,
        y: -Math.cos(angle) * velocity * 1.5,
      },
      particles: [],
      exploded: false,
      timeToExplode: target,
    };

    fireworksRef.current.push(firework);
  };

  const explodeFirework = (firework) => {
    const particleCount = 60 + Math.floor(Math.random() * 40);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 5 + 1;

      firework.particles.push({
        x: firework.x,
        y: firework.y,
        color: firework.color,
        velocity: {
          x: Math.cos(angle) * velocity * (0.5 + Math.random()),
          y: Math.sin(angle) * velocity * (0.5 + Math.random()),
        },
        alpha: 1,
        lifetime: Math.random() * 30 + 30,
        size: Math.random() * 3 + 1,
      });
    }
  };

  const updateAndDraw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    // Fundo transparente para não sobrepor o conteúdo 3D
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const currentFireworks = fireworksRef.current;
    for (let i = 0; i < currentFireworks.length; i++) {
      const firework = currentFireworks[i];

      if (!firework.exploded) {
        firework.x += firework.velocity.x;
        firework.y += firework.velocity.y;
        firework.velocity.y += 0.1;

        ctx.beginPath();
        ctx.arc(firework.x, firework.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = firework.color;
        ctx.fill();

        if (
          firework.y <= firework.timeToExplode ||
          firework.velocity.y >= 0 ||
          firework.x < 0 ||
          firework.x > canvas.width
        ) {
          if (firework.y > 0 && firework.y < canvas.height) { 
            explodeFirework(firework);
          }
          firework.exploded = true;
        }
      } else {
        for (let j = 0; j < firework.particles.length; j++) {
          const particle = firework.particles[j];

          particle.x += particle.velocity.x;
          particle.y += particle.velocity.y;
          particle.velocity.y += 0.05;
          particle.alpha -= 1 / particle.lifetime;

          if (particle.alpha <= 0.1) {
            firework.particles.splice(j, 1);
            j--;
            continue;
          }

          ctx.globalAlpha = particle.alpha;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        if (firework.particles.length === 0) {
          currentFireworks.splice(i, 1);
          i--;
        }
      }
    }

    // Se estiver ativo, continua a animação
    if (isActive) {
      // Cria novos fogos automaticamente quando ativo
      const now = Date.now();
      if (now - lastFireworkTimeRef.current > 800 + Math.random() * 1200) {
        const numberOfFireworks = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numberOfFireworks; i++) {
          createFirework();
        }
        lastFireworkTimeRef.current = now;
      }
      
      animationFrameRef.current = requestAnimationFrame(updateAndDraw);
    } else if (currentFireworks.length === 0 && onComplete) {
      // Se não está ativo e não há mais fogos, chama onComplete
      onComplete();
    }
  };

  useEffect(() => {
    if (!isActive) {
      // Limpa fogos existentes quando não está ativo
      fireworksRef.current = [];
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    // Inicia o show de fogos
    for (let i = 0; i < 3; i++) {
      setTimeout(() => createFirework(), i * 300);
    }
    lastFireworkTimeRef.current = Date.now();

    animationFrameRef.current = requestAnimationFrame(updateAndDraw);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [isActive]);

  if (!isActive) return children;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          pointerEvents: 'none',
          zIndex: 500
        }} 
      />
      <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default FireworksShow; 