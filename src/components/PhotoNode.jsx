/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { motion } from "framer-motion-3d";
import { TextureLoader, DoubleSide } from "three";
import { setTargetImage } from "../actions.js";
import { isMobile, getMobileAnimationSettings, throttle } from "../utils/mobileOptimizations.js";

const aspectRatio = 16 / 16;
const thumbHeight = 16;
const thumbWidth = thumbHeight * aspectRatio;
const localImageBasePath = "/images/";

// Get mobile settings once
const mobileSettings = getMobileAnimationSettings();
const isOnMobile = isMobile();

export default function PhotoNode({
  id,
  x = 0,
  y = 0,
  z = 0,
  selectedImageId,
  description,
}) {
  console.log('PhotoNode rendering for id:', id); // Debug log
  
  // Back to simple useLoader - the cache was causing issues
  const texture = useLoader(TextureLoader, `${localImageBasePath}${id}`);
  console.log('Texture loaded for', id, ':', !!texture); // Debug log
  
  const nodeOpacity = !selectedImageId || selectedImageId === id ? 1 : 0.1;

  // Reduce animations on mobile for better performance but keep subtle breath
  const [animationValue, setAnimationValue] = useState(0);
  const frameCounterRef = useRef(0);
  
  useFrame((state) => {
    // Mobile gets slower, more subtle animation instead of none
    const animationSpeed = isOnMobile ? 8 : 4; // Slower on mobile
    const animationIntensity = isOnMobile ? 0.2 : 0.5; // More subtle on mobile
    
    // Throttle animation for performance
    frameCounterRef.current++;
    if (frameCounterRef.current % animationSpeed !== 0) return;
    
    const elapsed = state.clock.elapsedTime;
    const cycle = (elapsed % 8) / 8;
    const sineValue = Math.sin(cycle * Math.PI * 2);
    const easeInOut = sineValue * animationIntensity;
    
    setAnimationValue(easeInOut);
  });

  // Memoize calculations
  const movementFactors = useMemo(() => {
    const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
    let movementFactor = Math.min(distanceFromCenter * 0.3, 1.2);

    const isInFocus = selectedImageId === id;
    
    if (isInFocus) {
      movementFactor *= isOnMobile ? 0.1 : 0.3; // Slightly increased for mobile
    }

    let movementMultiplier = isOnMobile ? 400 : 800; // Increased for mobile
    if (isInFocus) {
      movementMultiplier *= isOnMobile ? 0.2 : 0.4;
    }

    // Increased mobile scale from 400 to 600 for better spacing
    const baseX = x * (isOnMobile ? 600 : 600); // Same scale as desktop now
    const baseY = y * (isOnMobile ? 600 : 600);
    const baseZ = z * (isOnMobile ? 600 : 600);

    return { movementFactor, movementMultiplier, baseX, baseY, baseZ };
  }, [x, y, z, selectedImageId, id]);

  // Optimize click/touch handling
  const handleInteraction = useCallback((e) => {
    e.stopPropagation();
    console.log('PhotoNode clicked:', id); // Debug log
    
    // Add haptic feedback on mobile
    if (isOnMobile && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    setTargetImage(id);
  }, [id]);

  // Calculate movement - now enabled for mobile too but more subtle
  const movementX = x * movementFactors.movementFactor * animationValue * movementFactors.movementMultiplier;
  const movementY = y * movementFactors.movementFactor * animationValue * movementFactors.movementMultiplier;
  const movementZ = z * movementFactors.movementFactor * animationValue * movementFactors.movementMultiplier;

  return (
    <motion.group
      onClick={handleInteraction}
      position={[x, y, z].map((n) => n * (isOnMobile ? 500 : 500))} // Same positioning scale
      animate={{
        x: movementFactors.baseX + movementX,
        y: movementFactors.baseY + movementY,
        z: movementFactors.baseZ + movementZ,
      }}
      transition={{ 
        duration: isOnMobile ? 0.2 : 0.1, // Slightly slower on mobile
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
    </motion.group>
  );
}
