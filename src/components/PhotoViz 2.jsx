/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from "react";
import {Canvas, useFrame, useThree} from '@react-three/fiber'
import {TrackballControls} from '@react-three/drei'
import {useRef, useState, useEffect} from 'react'
import * as THREE from 'three'
import useStore from '../store.js'
import PhotoNode from './PhotoNode.jsx'
import {setTargetImage} from '../actions.js'

function SceneContent() {
  const images = useStore.use.images()
  const nodePositions = useStore.use.nodePositions()
  const layout = useStore.use.layout()
  const highlightNodes = useStore.use.highlightNodes()
  const targetImage = useStore.use.targetImage()
  const resetCam = useStore.use.resetCam()
  const {camera} = useThree()
  const groupRef = useRef()
  const controlsRef = useRef()
  const [isAutoRotating, setIsAutoRotating] = useState(false)
  const rotationVelocityRef = useRef(0)

  // Animation state
  const animationRef = useRef({
    isAnimating: false,
    startTime: 0,
    duration: 800, // ms
    startPosition: new THREE.Vector3(),
    targetPosition: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    targetTarget: new THREE.Vector3()
  })

  const targetSpeed = 0.1 
  const acceleration = 0.5 
  const cameraDistance = 25

  const handleInteractionStart = () => {
    setIsAutoRotating(false)
    rotationVelocityRef.current = 0
    animationRef.current.isAnimating = false
  }

  const handleInteractionEnd = () => {
    // Could restart auto-rotation here if desired
  }

  // Smooth animation function
  const easeInOut = (t) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  }

  // Camera animation for target image selection
  useEffect(() => {
    if (camera && controlsRef.current && groupRef.current) {
      if (targetImage && nodePositions) {
        // Focus on target image with animation
        setIsAutoRotating(false)
        rotationVelocityRef.current = 0

        const nodePos = nodePositions[targetImage]
        if (!nodePos) {
          console.warn(`No node position found for targetImage: ${targetImage}`)
          return
        }

        const nodeLocalX = (nodePos[0] - 0.5) * 600
        const nodeLocalY = (nodePos[1] - 0.5) * 600
        const nodeLocalZ = ((nodePos[2] || 0) - 0.5) * 600

        const groupRotationY = groupRef.current.rotation.y
        const groupPositionZ = groupRef.current.position.z

        const targetNodeWorldVec = new THREE.Vector3(
          nodeLocalX * Math.cos(groupRotationY) - nodeLocalZ * Math.sin(groupRotationY),
          nodeLocalY,
          nodeLocalX * Math.sin(groupRotationY) + nodeLocalZ * Math.cos(groupRotationY) + groupPositionZ
        )

        const offsetDirection = camera.position.clone().sub(controlsRef.current.target)
        if (offsetDirection.lengthSq() === 0) {
          offsetDirection.set(0, 0, 1)
        }
        offsetDirection.normalize().multiplyScalar(cameraDistance)

        const targetCameraPosition = targetNodeWorldVec.clone().add(offsetDirection)

        // Setup animation
        animationRef.current.isAnimating = true
        animationRef.current.startTime = Date.now()
        animationRef.current.startPosition.copy(camera.position)
        animationRef.current.targetPosition.copy(targetCameraPosition)
        animationRef.current.startTarget.copy(controlsRef.current.target)
        animationRef.current.targetTarget.copy(targetNodeWorldVec)

      } else if (!targetImage) {
        // Return to default view with animation
        const defaultPosition = new THREE.Vector3(0, 0, 300)
        const defaultTarget = new THREE.Vector3(0, 0, 0)

        animationRef.current.isAnimating = true
        animationRef.current.startTime = Date.now()
        animationRef.current.startPosition.copy(camera.position)
        animationRef.current.targetPosition.copy(defaultPosition)
        animationRef.current.startTarget.copy(controlsRef.current.target)
        animationRef.current.targetTarget.copy(defaultTarget)
      }
    }
  }, [targetImage, nodePositions, camera])

  // Layout changes with animation
  useEffect(() => {
    if (groupRef.current) {
      const targetZ = layout === 'grid' ? 150 : 0
      
      // Simple lerp animation for group position
      const startZ = groupRef.current.position.z
      const animateGroup = () => {
        const elapsed = Date.now() - Date.now()
        let progress = 0
        
        const animate = () => {
          progress += 0.02
          if (progress >= 1) {
            groupRef.current.position.z = targetZ
            return
          }
          
          groupRef.current.position.z = THREE.MathUtils.lerp(startZ, targetZ, easeInOut(progress))
          requestAnimationFrame(animate)
        }
        animate()
      }
      
      if (Math.abs(startZ - targetZ) > 0.1) {
        animateGroup()
      }
      
      if (resetCam) {
        groupRef.current.rotation.set(0, 0, 0)
        useStore.setState(state => {
          state.resetCam = false
        })
      }
    }
  }, [layout, resetCam])

  useFrame((_, delta) => {
    // Handle camera animation
    if (animationRef.current.isAnimating && camera && controlsRef.current) {
      const elapsed = Date.now() - animationRef.current.startTime
      const progress = Math.min(elapsed / animationRef.current.duration, 1)
      const easedProgress = easeInOut(progress)

      // Animate camera position
      camera.position.lerpVectors(
        animationRef.current.startPosition,
        animationRef.current.targetPosition,
        easedProgress
      )

      // Animate camera target
      controlsRef.current.target.lerpVectors(
        animationRef.current.startTarget,
        animationRef.current.targetTarget,
        easedProgress
      )

      if (progress >= 1) {
        animationRef.current.isAnimating = false
        camera.position.copy(animationRef.current.targetPosition)
        controlsRef.current.target.copy(animationRef.current.targetTarget)
      }
    }

    // Simple auto-rotation (only when not animating)
    if (!animationRef.current.isAnimating) {
      let currentVelocity = rotationVelocityRef.current

      if (isAutoRotating) {
        currentVelocity += (targetSpeed - currentVelocity) * acceleration * delta
      } else {
        currentVelocity += (0 - currentVelocity) * acceleration * delta
      }

      rotationVelocityRef.current = currentVelocity

      if (
        groupRef.current &&
        Math.abs(currentVelocity) > 0.0001 &&
        layout !== 'grid' &&
        !targetImage
      ) {
        groupRef.current.rotation.y += currentVelocity * delta
      }
    }

    if (controlsRef.current) {
      controlsRef.current.update()
    }
  })

  return (
    <>
      <ambientLight intensity={2.3} />
      <TrackballControls
        ref={controlsRef}
        onStart={handleInteractionStart}
        onEnd={handleInteractionEnd}
        minDistance={20}
        maxDistance={1000}
        noPan
      />
      <group ref={groupRef}>
        {images?.map(image => {
          const normPosArray = nodePositions?.[image.id];
          if (!normPosArray) {
            console.warn(`[PhotoViz.jsx] No position found for image ID: ${image.id}`);
            return null;
          }

          return (
            <PhotoNode
              key={image.id}
              id={image.id}
              x={normPosArray[0]}
              y={normPosArray[1]}
              z={normPosArray[2] || 0}
              selectedImageId={targetImage}
              description={image.description}
            />
          )
        })}
      </group>
    </>
  )
}

export default function PhotoViz() {
  return (
    <Canvas
      camera={{position: [0, 0, 300], near: 0.1, far: 10000}}
      onPointerMissed={() => setTargetImage(null)}
    >
      <SceneContent />
    </Canvas>
  )
}
