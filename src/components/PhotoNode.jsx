/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { motion } from "framer-motion-3d";
import { TextureLoader, DoubleSide } from "three";
import { setTargetImage } from "../actions.js";

const aspectRatio = 16 / 16;
const thumbHeight = 16;
const thumbWidth = thumbHeight * aspectRatio;

// Cache de texturas para evitar recarregamentos
const textureCache = new Map();

export default function PhotoNode({
  id,
  x = 0,
  y = 0,
  z = 0,
  selectedImageId,
  description,
}) {
  const [texture, setTexture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const meshRef = useRef();
  
  const nodeOpacity = !selectedImageId || selectedImageId === id ? 1 : 0.2;

  // Carregamento lazy da textura
  useEffect(() => {
    const imagePath = `/src/assets/images/${id}`;
    
    // Verifica se a textura já está no cache
    if (textureCache.has(id)) {
      setTexture(textureCache.get(id));
      setIsLoading(false);
      return;
    }

    const loader = new TextureLoader();
    
    loader.load(
      imagePath,
      (loadedTexture) => {
        // Salva no cache
        textureCache.set(id, loadedTexture);
        setTexture(loadedTexture);
        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.error(`Failed to load texture for ${id}:`, error);
        setIsLoading(false);
      }
    );
  }, [id]);

  // Animação suave de opacidade
  useFrame((state, delta) => {
    if (meshRef.current && meshRef.current.material) {
      const targetOpacity = isLoading ? 0 : nodeOpacity;
      const currentOpacity = meshRef.current.material.opacity;
      
      // Lerp suave para opacidade
      const newOpacity = currentOpacity + (targetOpacity - currentOpacity) * delta * 3;
      meshRef.current.material.opacity = newOpacity;
    }
  });

  return (
    <motion.group
      onClick={(e) => {
        e.stopPropagation();
        console.log('PhotoNode clicked:', id);
        setTargetImage(id);
      }}
      position={[x * 500, y * 500, z * 500]}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      transition={{ 
        scale: { duration: 0.3, ease: "easeOut" },
        layout: { duration: 0.3, ease: "easeInOut" }
      }}
    >
      <Billboard>
        <mesh ref={meshRef} scale={[thumbWidth, thumbHeight, 1]}>
          <planeGeometry />
          {texture ? (
            <meshStandardMaterial
              map={texture}
              transparent={true}
              opacity={isLoading ? 0 : nodeOpacity}
              side={DoubleSide}
            />
          ) : (
            <meshStandardMaterial
              color={isLoading ? "gray" : "red"}
              transparent={true}
              opacity={isLoading ? 0.3 : nodeOpacity}
              side={DoubleSide}
            />
          )}
        </mesh>
      </Billboard>
    </motion.group>
  );
}
