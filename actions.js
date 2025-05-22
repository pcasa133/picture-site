/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import useStore from './store'
// import {queryLlm} from './llm' // Removed: queryLlm is no longer used
// import {queryPrompt} from './prompts' // Removed: queryPrompt is no longer used

const get = useStore.getState
const set = useStore.setState

export const init = async () => {
  if (get().didInit) {
    return
  }

  set(state => {
    state.didInit = true
  })

  const [images, sphere, umapGrid] = await Promise.all(
    ['meta', 'sphere', 'umap-grid'].map(
      path => fetch(path + '.json').then(res => res.json())
    )
  )

  set(state => {
    state.images = images
    state.layouts = {
      sphere,
      grid: Object.fromEntries(
        Object.entries(umapGrid).map(([k, [x, y]]) => [
          k,
          [x, y / (16 / 9) + 0.25]
        ])
      )
    }
    state.nodePositions = Object.fromEntries(
      images.map(({id}) => [id, [0.5, 0.5, 0.5]])
    )
  })

  setLayout('sphere')
}

export const setLayout = layout =>
  set(state => {
    state.layout = layout
    state.nodePositions = state.layouts[layout]
  })

export const setSphereLayout = positions =>
  set(state => {
    state.layouts.sphere = positions
  })

// Removed sendQuery function

// Removed clearQuery function

// Removed setXRayMode function

export const setTargetImage = async targetImage => {
  if (targetImage === get().targetImage) {
    targetImage = null
  }

  set(state => {
    state.targetImage = targetImage
    // state.isFetching = !!targetImage; // Removed isFetching logic
    state.highlightNodes = null // Keep this to clear previous highlights
  })

  if (!targetImage) {
    // set(state => { state.isFetching = false; }); // Removed isFetching logic
    return
  }

  // Any async operations related to selecting an image would go here.
  // For now, it's just setting the target.
  // set(state => { state.isFetching = false; }); // Removed isFetching logic
}

export const toggleSidebar = () =>
  set(state => {
    state.isSidebarOpen = !state.isSidebarOpen
  })

export const setSidebarOpen = isOpen =>
  set(state => {
    state.isSidebarOpen = isOpen
  })

init()
