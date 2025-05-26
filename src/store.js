/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import 'immer'
import {create} from 'zustand'
import {immer} from 'zustand/middleware/immer'
import {createSelectorFunctions} from 'auto-zustand-selectors-hook'

export default createSelectorFunctions(
  create(
    immer(() => ({
      didInit: false,
      images: null,
      layout: 'sphere',
      layouts: null,
      nodePositions: null,
      highlightNodes: null, // Retained: used for highlighting targetImage, set to null by setTargetImage
      // isFetching: false, // Removed
      isSidebarOpen: false,
      // xRayMode: false, // Removed
      targetImage: null,
      // caption: null, // Removed
      resetCam: false,
      cameraCurrentZ: 0,
    }))
  )
)
