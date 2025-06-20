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

  const [sphereLayoutData, umapGridLayoutData, number6LayoutData, layout1Data, layout2Data, layout3Data, layout4Data, layout5Data] = await Promise.all(
    ['sphere', 'umap-grid', 'number6-layout', 'layout1', 'layout2', 'layout3', 'layout4', 'layout5'].map(
      path => fetch(`/${path}.json`).then(res => res.json())
    )
  );

  const images = localMeta;

  // Extrai apenas os valores (coordenadas) dos layouts, mantendo a ordem original.
  const spherePositions = Object.values(sphereLayoutData);
  const gridPositions = Object.values(umapGridLayoutData).map(([x, y]) => [x, y / (16 / 9) + 0.25]);
  const number6Positions = Object.values(number6LayoutData);
  const layout1Positions = Object.values(layout1Data);
  const layout2Positions = Object.values(layout2Data);
  const layout3Positions = Object.values(layout3Data);
  const layout4Positions = Object.values(layout4Data);
  const layout5Positions = Object.values(layout5Data);

  set(state => {
    state.images = images
    // Armazena as listas de coordenadas em vez dos objetos mapeados por ID antigo
    state.rawLayoutPositions = {
      sphere: spherePositions,
      grid: gridPositions,
      number6: number6Positions,
      layout1: layout1Positions,
      layout2: layout2Positions,
      layout3: layout3Positions,
      layout4: layout4Positions,
      layout5: layout5Positions,
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
  console.log('setTargetImage called with:', targetImage); // Debug log
  
  if (targetImage === get().targetImage) {
    targetImage = null
  }

  console.log('Setting targetImage to:', targetImage); // Debug log

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

// Nova função para alternar para o layout do número 6
export const setNumber6Layout = () => {
  setLayout('number6')
}

// Nova função para fazer o ciclo entre os modos
export const cycleModes = () => {
  const state = get()
  const currentMode = state.currentMode
  
  // Ciclo: 0 (normal) -> 1 -> 2 -> 3 -> 4 -> 5 -> 6 (number6) -> 0 (volta ao normal)
  const nextMode = (currentMode + 1) % 7
  
  set(state => {
    state.currentMode = nextMode
    if (nextMode === 6) {
      state.isNumber6Mode = true
    } else {
      state.isNumber6Mode = false
    }
  })
  
  // Define o layout baseado no modo
  switch (nextMode) {
    case 0:
      setLayout('sphere')
      break
    case 1:
      setLayout('layout1')
      break
    case 2:
      setLayout('layout2')
      break
    case 3:
      setLayout('layout3')
      break
    case 4:
      setLayout('layout4')
      break
    case 5:
      setLayout('layout5')
      break
    case 6:
      setLayout('number6')
      break
    default:
      setLayout('sphere')
  }
}

init()
