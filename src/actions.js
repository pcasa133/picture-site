/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import useStore from './store'
// import {queryLlm} from './llm' // Removed: queryLlm is no longer used
// import {queryPrompt} from './prompts' // Removed: queryPrompt is no longer used
import localMeta from './data/meta.json'; // <-- ADICIONADO: Importar o meta.json local

const get = useStore.getState
const set = useStore.setState

export const init = async () => {
  if (get().didInit) {
    return
  }

  set(state => {
    state.didInit = true
  })

  const [sphereLayoutData, umapGridLayoutData] = await Promise.all(
    ['sphere', 'umap-grid'].map(
      path => fetch(`/${path}.json`).then(res => res.json())
    )
  );

  const images = localMeta;

  // Extrai apenas os valores (coordenadas) dos layouts, mantendo a ordem original.
  const spherePositions = Object.values(sphereLayoutData);
  const gridPositions = Object.values(umapGridLayoutData).map(([x, y]) => [x, y / (16 / 9) + 0.25]);


  set(state => {
    state.images = images
    // Armazena as listas de coordenadas em vez dos objetos mapeados por ID antigo
    state.rawLayoutPositions = {
      sphere: spherePositions,
      grid: gridPositions,
    };
    // Inicializa nodePositions com posições padrão, setLayout cuidará da atribuição correta
    state.nodePositions = Object.fromEntries(
      images.map(({id}) => [id, [0.5, 0.5, 0.5]])
    );
    state.layouts = {}; // Limpa layouts antigos baseados em ID
  })

  setLayout('sphere')
}

export const setLayout = layout =>
  set(state => {
    state.layout = layout;
    const availablePositions = state.rawLayoutPositions[layout];

    if (!availablePositions) {
      console.error(`Layout positions for "${layout}" not found in state.rawLayoutPositions.`);
      state.nodePositions = Object.fromEntries(
        state.images.map(({ id }) => [id, [0.5, 0.5, 0.5]])
      );
      return;
    }

    // Atribui as posições disponíveis para as imagens atuais, em ordem.
    // Se houver mais imagens do que posições, as extras pegam a última posição válida ou uma padrão.
    // Se houver menos imagens, algumas posições não serão usadas.
    const newPositions = {};
    state.images.forEach((image, index) => {
      if (index < availablePositions.length) {
        newPositions[image.id] = availablePositions[index];
      } else {
        // Fallback para imagens extras: usar a última posição ou uma padrão
        newPositions[image.id] = availablePositions[availablePositions.length - 1] || [0.5, 0.5, 0.5];
      }
    });
    state.nodePositions = newPositions;
  });

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
    if (targetImage === null) {
      state.resetCam = true; // <-- ADICIONADO: Ativar o reset da câmera ao desmarcar
    }
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
