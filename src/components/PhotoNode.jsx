/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from "react";
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

  return (
    <motion.group
      onClick={(e) => {
        e.stopPropagation();
        console.log('PhotoNode clicked:', id); // Debug log
        setTargetImage(id);
      }}
      position={[x, y, z].map((n) => n * 500)} // Kept original scaling factor for consistency
      animate={{
        x: x * 600,
        y: y * 600,
        z: z * 600,
        transition: { duration: 1, ease: "circInOut" },
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
