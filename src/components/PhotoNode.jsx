/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState } from "react";
import { useLoader } from "@react-three/fiber";
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
  const nodeOpacity = !selectedImageId || selectedImageId === id ? 1 : 0.2; // <--- NOVA LÓGICA DE OPACIDADE

  // Estado para controlar a animação de movimento contínuo
  const [animationValue, setAnimationValue] = useState(0);

  // Efeito para criar movimento contínuo e simétrico
  useEffect(() => {
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000; // tempo em segundos
      const cycle = (elapsed % 8) / 8; // ciclo de 8 segundos normalizado (0 a 1)
      
      // Usa seno para movimento suave e simétrico
      const sineValue = Math.sin(cycle * Math.PI * 2);
      setAnimationValue(sineValue);
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }, []);

  // Calcula o fator de movimento baseado na distância do centro
  const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
  const movementFactor = Math.min(distanceFromCenter * 0.03, 0.1); // Aumentei um pouco o movimento

  // Calcula as posições com movimento sutil e simétrico
  const baseX = x * 600;
  const baseY = y * 600;
  const baseZ = z * 600;

  // Movimento baseado no valor do seno (-1 a 1)
  const movementX = x * movementFactor * animationValue * 80;
  const movementY = y * movementFactor * animationValue * 80;
  const movementZ = z * movementFactor * animationValue * 80;

  return (
    <motion.group
      onClick={(e) => {
        e.stopPropagation();
        console.log('PhotoNode clicked:', id); // Debug log
        setTargetImage(id);
      }}
      position={[x, y, z].map((n) => n * 500)} // Kept original scaling factor for consistency
      animate={{
        x: baseX + movementX,
        y: baseY + movementY,
        z: baseZ + movementZ,
        transition: { 
          duration: 0.1, 
          ease: "linear",
          type: "tween"
        },
      }}
    >
      <Billboard>
        <mesh scale={[thumbWidth, thumbHeight, 1]}>
          <planeGeometry />
          {texture ? (
            <motion.meshStandardMaterial
              map={texture}
              initial={{ opacity: 0 }}
              animate={{ opacity: nodeOpacity }}
              transition={{ duration: 0.5 }}
              transparent={nodeOpacity < 1.0}
              side={DoubleSide} // Ensures texture is visible if camera goes behind
            />
          ) : (
            <motion.meshStandardMaterial
              color="red"
              initial={{ opacity: 0 }}
              animate={{ opacity: nodeOpacity }}
              transition={{ duration: 0.5 }}
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
