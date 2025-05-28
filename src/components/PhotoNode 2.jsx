/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from "react";
import { Billboard } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { setTargetImage } from "../actions.js";

// const localImageBasePath = "../assets/images/"; // <-- ADICIONADO: Caminho base para imagens locais
const localImageBasePath = "/src/assets/images/"; // <-- ALTERADO: Caminho absoluto a partir da raiz do servidor

const aspectRatio = 16 / 16;
const thumbHeight = 64; // Tamanho maior que o original
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
  const textureUrl = `/src/assets/images/${id}`;
  
  const meshRef = useRef();
  const groupRef = useRef();
  const [texture, setTexture] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Animation state
  const targetPosition = useRef(new THREE.Vector3(x * 500, y * 500, z * 500));
  const currentPosition = useRef(new THREE.Vector3(x * 500, y * 500, z * 500));
  const targetOpacity = useRef(!selectedImageId || selectedImageId === id ? 1 : 0.2);
  const currentOpacity = useRef(0);
  const targetScale = useRef(1);
  const currentScale = useRef(1);
  
  // Load texture
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      textureUrl,
      (loadedTexture) => {
        setTexture(loadedTexture);
        setIsLoaded(true);
      },
      undefined,
      (error) => {
        console.error(`Failed to load texture for ${id}:`, error);
        setIsLoaded(true); // Still mark as loaded to show fallback
      }
    );
  }, [textureUrl, id]);
  
  // Update target position when props change
  useEffect(() => {
    targetPosition.current.set(x * 500, y * 500, z * 500);
  }, [x, y, z]);
  
  // Update target opacity when selection changes
  useEffect(() => {
    targetOpacity.current = !selectedImageId || selectedImageId === id ? 1 : 0.2;
  }, [selectedImageId, id]);
  
  // Smooth animations
  useFrame((state, delta) => {
    if (!isLoaded) return;
    
    // Animate position
    if (groupRef.current) {
      currentPosition.current.lerp(targetPosition.current, delta * 3);
      groupRef.current.position.copy(currentPosition.current);
    }
    
    // Animate opacity and scale
    if (meshRef.current && meshRef.current.material) {
      // Opacity animation
      currentOpacity.current = THREE.MathUtils.lerp(
        currentOpacity.current,
        targetOpacity.current,
        delta * 4
      );
      meshRef.current.material.opacity = currentOpacity.current;
      
      // Scale animation
      const hoverScale = isHovered ? 1.1 : 1;
      currentScale.current = THREE.MathUtils.lerp(
        currentScale.current,
        hoverScale,
        delta * 5
      );
      meshRef.current.scale.setScalar(currentScale.current);
    }
  });
  
  if (!isLoaded) {
    return null; // Don't render until loaded
  }

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        setTargetImage(id);
      }}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <Billboard>
        <mesh ref={meshRef} scale={[thumbWidth, thumbHeight, 1]}>
          <planeGeometry />
          <meshStandardMaterial
            map={texture}
            color={texture ? "white" : "red"}
            transparent={true}
            opacity={currentOpacity.current}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Billboard>

      {/* Removed Billboard with Text description */}
    </group>
  );
}
