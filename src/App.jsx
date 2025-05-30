/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { Suspense, useEffect } from "react";
import c from "clsx";
import PhotoViz from "./components/PhotoViz.jsx";
import useStore from "./store.js";
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import SimpleLoader from "./components/SimpleLoader.jsx";
import PerformanceMonitor from "./components/PerformanceMonitor.jsx";
// import UnicornBackground from './components/UnicornBackground.jsx'; // REMOVED - High memory usage
import testimonialsData from './data/testimonials.json';

import {
  setLayout,
  init,
  // sendQuery, // Removed
  // clearQuery, // Removed
  // setXRayMode, // Removed
  // toggleSidebar, // Moved to Header
} from "./actions.js";

export default function App() {
  const layout = useStore.use.layout();
  const images = useStore.use.images();
  const targetImage = useStore.use.targetImage();
  const didInit = useStore.use.didInit();
  
  console.log("Current targetImage:", targetImage);
  
  const selectedImageDescription = targetImage && images
    ? images.find(img => img.id === targetImage)?.description
    : null;
  console.log("Current selectedImageDescription:", selectedImageDescription);

  // Buscar depoimento correspondente
  const selectedTestimonial = targetImage 
    ? testimonialsData.find(testimonial => testimonial.id === targetImage)
    : null;

  // Inicializa os dados quando o componente monta
  useEffect(() => {
    if (!didInit) {
      console.log("Initializing app data...");
      init();
    }
  }, [didInit]);

  // Layout buttons are removed from footer, but functionality could be added elsewhere if needed.
  // For now, direct calls to setLayout can be done programmatically or via other UI if desired.
  // Example: useEffect(() => setLayout('sphere'), []); to set initial layout.

  return (
    <>
      {/* <UnicornBackground /> REMOVED - High memory usage */}
      <PerformanceMonitor />
      <Header />
      <main>
        <Suspense fallback={<SimpleLoader />}>
          <PhotoViz />
        </Suspense>
        <Sidebar />
        
        {selectedTestimonial && (
          <div className={c("description-panel", { visible: !!selectedTestimonial })}>
            <div className="description-panel-header">
              <div className="description-panel-client-info">
                <div className="description-panel-client-name">{selectedTestimonial.nome}</div>
                <div className="description-panel-client-location">{selectedTestimonial.cidade}</div>
              </div>
            </div>
            <div className="description-panel-content">"{selectedTestimonial.depoimento}"</div>
          </div>
        )}

        {/* Removed footer and all its contents (search bar, controls) */}
        {/* Sidebar button and zoom indicator moved to header */}
      </main>
    </>
  );
}
