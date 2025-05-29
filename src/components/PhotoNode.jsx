/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState, useMemo } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei"; // Text removed
import { motion } from "framer-motion-3d";
import { TextureLoader, DoubleSide } from "three"; // Added DoubleSide for material
import { setTargetImage } from "../actions.js";

// const localImageBasePath = "../assets/images/"; // <-- ADICIONADO: Caminho base para imagens locais
const localImageBasePath = "/src/assets/images/"; // <-- ALTERADO: Caminho absoluto a partir da raiz do servidor

const aspectRatio = 16 / 16;
const thumbHeight = 16;
const thumbWidth = thumbHeight * aspectRatio;

export default function PhotoNode({
  id,
  x = 0,
  y = 0,
  z = 0,
  selectedImageId,
  // highlight, // REMOVIDO
  // dim, // REMOVIDO
  // xRayMode, // Removed
  description, // Kept for potential future use, but not displayed in node
}) {
  const texture = useLoader(TextureLoader, `${localImageBasePath}${id}`);
  // const nodeOpacity = highlight ? 1 : dim ? 0.2 : 0.7; // REMOVIDO
  const nodeOpacity = !selectedImageId || selectedImageId === id ? 1 : 0.1; // <--- Reduzido de 0.2 para 0.1 (mais sutil)

  // Usa useFrame em vez de requestAnimationFrame para melhor performance
  const [animationValue, setAnimationValue] = useState(0);
  
  // Throttle da animação para otimizar performance
  let frameCounter = 0;
  
  useFrame((state) => {
    // Atualiza animação apenas a cada 2 frames (30fps em vez de 60fps para animação)
    frameCounter++;
    if (frameCounter % 2 !== 0) return;
    
    // Usa o clock do Three.js que é mais otimizado
    const elapsed = state.clock.elapsedTime;
    const cycle = (elapsed % 8) / 8; // ciclo de 8 segundos
    
    // Simplifica cálculo - remove Math.pow para melhor performance
    const sineValue = Math.sin(cycle * Math.PI * 2);
    const easeInOut = sineValue * 0.8; // Simplificado, sem Math.pow
    
    setAnimationValue(easeInOut);
  });

  // Memoiza cálculos pesados para evitar recalcular a cada render
  const movementFactors = useMemo(() => {
    const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
    let movementFactor = Math.min(distanceFromCenter * 0.3, 1.2);

    const isMobile = window.innerWidth <= 768;
    const isInFocus = selectedImageId === id;
    
    if (isInFocus) {
      movementFactor *= isMobile ? 0.15 : 0.3;
    }

    let movementMultiplier = 800;
    if (isInFocus) {
      movementMultiplier *= isMobile ? 0.2 : 0.4;
    }

    const baseX = x * 600;
    const baseY = y * 600;
    const baseZ = z * 600;

    return { movementFactor, movementMultiplier, baseX, baseY, baseZ };
  }, [x, y, z, selectedImageId, id]);

  const movementX = x * movementFactors.movementFactor * animationValue * movementFactors.movementMultiplier;
  const movementY = y * movementFactors.movementFactor * animationValue * movementFactors.movementMultiplier;
  const movementZ = z * movementFactors.movementFactor * animationValue * movementFactors.movementMultiplier;

  return (
    <motion.group
      onClick={(e) => {
        e.stopPropagation();
        setTargetImage(id);
      }}
      position={[x, y, z].map((n) => n * 500)} // Kept original scaling factor for consistency
      animate={{
        x: movementFactors.baseX + movementX,
        y: movementFactors.baseY + movementY,
        z: movementFactors.baseZ + movementZ,
      }}
      transition={{ 
        duration: 0.1, 
        ease: "linear",
        type: "tween"
      }}
    >
      <Billboard>
        <mesh scale={[thumbWidth, thumbHeight, 1]}>
          <planeGeometry />
          {texture ? (
            <meshStandardMaterial
              map={texture}
              opacity={nodeOpacity}
              transparent={nodeOpacity < 1.0}
              side={DoubleSide}
            />
          ) : (
            <meshStandardMaterial
              color="red"
              opacity={nodeOpacity}
              transparent={nodeOpacity < 1.0}
              side={DoubleSide}
            />
          )}
        </mesh>
      </Billboard>

      {/* Removed Billboard with Text description */}
    </motion.group>
  );
}
