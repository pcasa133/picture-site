/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from "react";
import {Canvas, useFrame, useThree} from '@react-three/fiber'
import {TrackballControls} from '@react-three/drei'
import {useRef, useState, useEffect} from 'react'
import {animate} from 'motion'
import useStore from '../store.js'
import PhotoNode from './PhotoNode.jsx'
import {setTargetImage} from '../actions.js'

function SceneContent() {
  const images = useStore.use.images()
  const nodePositions = useStore.use.nodePositions()
  const layout = useStore.use.layout()
  const highlightNodes = useStore.use.highlightNodes()
  const targetImage = useStore.use.targetImage()
  // const xRayMode = useStore.use.xRayMode(); // Removed
  const resetCam = useStore.use.resetCam()
  const {camera} = useThree()
  const groupRef = useRef()
  const controlsRef = useRef()
  const [isAutoRotating, setIsAutoRotating] = useState(false) // Auto-rotation logic retained
  const inactivityTimerRef = useRef(null)
  const rotationVelocityRef = useRef(0)

  const cameraDistance = 25
  const targetSpeed = 0.1 
  const acceleration = 0.5 

  const restartInactivityTimer = () => {
    clearTimeout(inactivityTimerRef.current)
    // Temporarily disable auto-rotation start on inactivity as it might be distracting
    // inactivityTimerRef.current = setTimeout(() => {
    //   setIsAutoRotating(true) 
    // }, 5000); // Increased inactivity time
  }

  const handleInteractionStart = () => {
    setIsAutoRotating(false)
    clearTimeout(inactivityTimerRef.current)
    rotationVelocityRef.current = 0
  }

  const handleInteractionEnd = () => {
    restartInactivityTimer()
  }

  useEffect(() => {
    if (
      targetImage &&
      nodePositions &&
      layout &&
      camera &&
      controlsRef.current &&
      groupRef.current
    ) {
      setIsAutoRotating(false)
      clearTimeout(inactivityTimerRef.current)
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

      const targetNodeWorldVec = {
        x:
          nodeLocalX * Math.cos(groupRotationY) -
          nodeLocalZ * Math.sin(groupRotationY),
        y: nodeLocalY,
        z:
          nodeLocalX * Math.sin(groupRotationY) +
          nodeLocalZ * Math.cos(groupRotationY) +
          groupPositionZ
      }

      const duration = 0.8
      const ease = 'easeInOut'

      const currentControlsTarget = controlsRef.current.target.clone()
      const controlsTargetAnimations = [
        animate(currentControlsTarget.x, targetNodeWorldVec.x, {
          duration,
          ease,
          onUpdate: latest => {
            if (controlsRef.current) {
              controlsRef.current.target.x = latest
            }
          }
        }),
        animate(currentControlsTarget.y, targetNodeWorldVec.y, {
          duration,
          ease,
          onUpdate: latest => {
            if (controlsRef.current) {
              controlsRef.current.target.y = latest
            }
          }
        }),
        animate(currentControlsTarget.z, targetNodeWorldVec.z, {
          duration,
          ease,
          onUpdate: latest => {
            if (controlsRef.current) {
              controlsRef.current.target.z = latest
            }
          }
        })
      ]

      const offsetDirection = camera.position
        .clone()
        .sub(controlsRef.current.target)

      if (offsetDirection.lengthSq() === 0) {
        offsetDirection.set(0, 0, 1)
      }
      offsetDirection.normalize().multiplyScalar(cameraDistance)

      const targetCameraPositionVec = {
        x: targetNodeWorldVec.x + offsetDirection.x,
        y: targetNodeWorldVec.y + offsetDirection.y,
        z: targetNodeWorldVec.z + offsetDirection.z
      }

      const cameraPositionAnimations = [
        animate(camera.position.x, targetCameraPositionVec.x, {
          duration,
          ease,
          onUpdate: latest => (camera.position.x = latest)
        }),
        animate(camera.position.y, targetCameraPositionVec.y, {
          duration,
          ease,
          onUpdate: latest => (camera.position.y = latest)
        }),
        animate(camera.position.z, targetCameraPositionVec.z, {
          duration,
          ease,
          onUpdate: latest => (camera.position.z = latest)
        })
      ]

      const allAnimations = [
        ...controlsTargetAnimations,
        ...cameraPositionAnimations
      ]

      Promise.all(allAnimations.map(a => a.finished)).then(() => {
        if (controlsRef.current && camera) {
          camera.position.set(
            targetCameraPositionVec.x,
            targetCameraPositionVec.y,
            targetCameraPositionVec.z
          )
          controlsRef.current.target.set(
            targetNodeWorldVec.x,
            targetNodeWorldVec.y,
            targetNodeWorldVec.z
          )
        }
      })

    } else if (!targetImage) {
      restartInactivityTimer()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetImage, nodePositions, layout, camera]) // Removed controlsRef, groupRef from deps as they are refs

  useEffect(() => {
    const controls = controlsRef.current
    // const targetLayoutPosition = [0, 0, 300] // Default camera position - OLD
    // const targetControlsTarget = [0, 0, 0] // Default look-at point - OLD
    const duration = 0.8
    const ease = 'easeInOut'

    if (controls && camera && resetCam) { // Only reset if resetCam is true
      let dynamicCameraZOffset = 300; // Default Z offset from camera target
      const groupTargetZ = layout === 'grid' ? 150 : 0; // Target Z for the center of the group of images

      if (nodePositions && images && images.length > 0) {
        const allNodePosValues = Object.values(nodePositions);
        if (allNodePosValues.length > 0) {
          let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
          
          allNodePosValues.forEach(posArray => {
            // posArray is [x, y, z] from nodePositions (normalized values, e.g. 0 to 1)
            // We use the same scaling factor as in PhotoNode for consistency
            const x = (posArray[0] - 0.5) * 600;
            const y = (posArray[1] - 0.5) * 600;
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
          });

          const spreadX = maxX - minX;
          const spreadY = maxY - minY;
          // Ensure there's a minimum spread if only one image, based on typical node size
          const singleNodeVisualSize = 32; // Approx. visual size of a node to prevent over-zooming
          const maxSpread = Math.max(spreadX, spreadY, images.length === 1 ? singleNodeVisualSize : 0);

          if (maxSpread > 0) {
            const fovRad = (camera.fov * Math.PI) / 180; // camera.fov is in degrees
            // Calculate distance to fit (maxSpread / 0.8) in viewport (to make maxSpread occupy 80%)
            let calculatedDistance = ((maxSpread / 0.8) / 2) / Math.tan(fovRad / 2);
            calculatedDistance *= 1.15; // Add 15% padding for a bit more room
            
            // Clamp the calculated distance to a reasonable range
            dynamicCameraZOffset = Math.max(150, Math.min(calculatedDistance, 195));
          } else {
            // Fallback if no spread or single image with no effective size calculated yet
            dynamicCameraZOffset = images.length === 1 ? 150 : 195;
          }
        }
      }

      const newCameraTarget = [0, 0, groupTargetZ];
      const newCameraPosition = [0, 0, groupTargetZ + dynamicCameraZOffset];

      const currentCameraTarget = controls.target.clone()

      const cameraAndTargetAnimations = [
        animate(camera.position.x, newCameraPosition[0], {
          duration,
          ease,
          onUpdate: latest => (camera.position.x = latest)
        }),
        animate(camera.position.y, newCameraPosition[1], {
          duration,
          ease,
          onUpdate: latest => (camera.position.y = latest)
        }),
        animate(camera.position.z, newCameraPosition[2], {
          duration,
          ease,
          onUpdate: latest => (camera.position.z = latest)
        }),
        animate(currentCameraTarget.x, newCameraTarget[0], {
          duration,
          ease,
          onUpdate: latest => {
            if (controlsRef.current) {
              controlsRef.current.target.x = latest
            }
          }
        }),
        animate(currentCameraTarget.y, newCameraTarget[1], {
          duration,
          ease,
          onUpdate: latest => {
            if (controlsRef.current) {
              controlsRef.current.target.y = latest
            }
          }
        }),
        animate(currentCameraTarget.z, newCameraTarget[2], {
          duration,
          ease,
          onUpdate: latest => {
            if (controlsRef.current) {
              controlsRef.current.target.z = latest
            }
          }
        })
      ]

      Promise.all(cameraAndTargetAnimations.map(a => a.finished)).then(() => {
        if (controlsRef.current && camera) {
          camera.position.set(...newCameraPosition)
          controlsRef.current.target.set(...newCameraTarget)
        }
      })
    }

    if (groupRef.current && (layout || resetCam)) { // Animate group on layout change or resetCam
      const durationInner = 0.8
      const easeInner = 'easeInOut'

      animate(
        groupRef.current.position.z,
        layout === 'grid' ? 150 : 0, // Simplified: 'cluster3d' was complex, sphere is 0
        {
          duration: durationInner,
          ease: easeInner,
          onUpdate: latest => (groupRef.current.position.z = latest)
        }
      )
      if (resetCam) { // Only reset rotations if resetCam is true
         animate(groupRef.current.rotation.x, 0, {
          duration: durationInner,
          ease: easeInner,
          onUpdate: latest => (groupRef.current.rotation.x = latest)
        })
        animate(groupRef.current.rotation.y, 0, {
          duration: durationInner,
          ease: easeInner,
          onUpdate: latest => (groupRef.current.rotation.y = latest)
        })
        animate(groupRef.current.rotation.z, 0, {
          duration: durationInner,
          ease: easeInner,
          onUpdate: latest => (groupRef.current.rotation.z = latest)
        })
      }
    }
    if(resetCam){
      useStore.setState(state=>{
        state.resetCam = false;
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, camera, resetCam, images, nodePositions]); // Added images and nodePositions to dependencies

  useFrame((_, delta) => {
    // Atualiza a posição Z da câmera no store
    useStore.setState({ cameraCurrentZ: camera.position.z });

    let currentVelocity = rotationVelocityRef.current

    if (isAutoRotating) {
      currentVelocity += (targetSpeed - currentVelocity) * acceleration * delta
    } else {
      currentVelocity += (0 - currentVelocity) * acceleration * delta // Decelerate
    }

    rotationVelocityRef.current = currentVelocity

    if (
      groupRef.current &&
      Math.abs(currentVelocity) > 0.0001 &&
      layout !== 'grid' && // No auto-rotation for grid layout
      !targetImage // No auto-rotation when an image is targeted
    ) {
      groupRef.current.rotation.y += currentVelocity * delta
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
        maxDistance={195}
        noPan
      />
      <group ref={groupRef}>
        {images?.map(image => {
          // const isHighlighted = highlightNodes?.includes(image.id) // highlightNodes will be null // REMOVIDO

          return (
            <PhotoNode
              key={image.id}
              id={image.id}
              description={image.description}
              x={nodePositions?.[image.id][0] - 0.5}
              y={nodePositions?.[image.id][1] - 0.5}
              z={(nodePositions?.[image.id][2] || 0) - 0.5}
              selectedImageId={targetImage} // <--- ADICIONADO: Passar targetImage
              // highlight={ // REMOVIDO
              //   // (highlightNodes && isHighlighted) || // This part will be false as highlightNodes is null
              //   (targetImage && targetImage === image.id)
              // }
              // dim={ // REMOVIDO
              //   // (highlightNodes && !isHighlighted) || // This part will be false
              //   (targetImage && targetImage !== image.id)
              // }
              // xRayMode={xRayMode} // Removed
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
      camera={{position: [0, 0, 195], near: 0.1, far: 10000}}
      onPointerMissed={() => setTargetImage(null)}
    >
      <SceneContent />
    </Canvas>
  )
}
