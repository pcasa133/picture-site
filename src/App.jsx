/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from "react";
import { useRef } from "react";
import c from "clsx";
import PhotoViz from "./components/PhotoViz.jsx";
import useStore from "./store.js";
import Sidebar from "./components/Sidebar.jsx";

import {
  setLayout,
  // sendQuery, // Removed
  // clearQuery, // Removed
  // setXRayMode, // Removed
  toggleSidebar,
} from "./actions.js";

export default function App() {
  const layout = useStore.use.layout();
  const isSidebarOpen = useStore.use.isSidebarOpen();
  const images = useStore.use.images();
  const targetImage = useStore.use.targetImage();
  const cameraCurrentZ = useStore.use.cameraCurrentZ();
  console.log("Current targetImage:", targetImage);
  
  const selectedImageDescription = targetImage && images
    ? images.find(img => img.id === targetImage)?.description
    : null;
  console.log("Current selectedImageDescription:", selectedImageDescription);

  // Layout buttons are removed from footer, but functionality could be added elsewhere if needed.
  // For now, direct calls to setLayout can be done programmatically or via other UI if desired.
  // Example: useEffect(() => setLayout('sphere'), []); to set initial layout.

  return (
    <main>
      <PhotoViz />
      <Sidebar />
      
      {selectedImageDescription && (
        <div className={c("description-panel", { visible: !!selectedImageDescription })}>
          <p>{selectedImageDescription}</p>
        </div>
      )}

      {/* Removed footer and all its contents (search bar, controls) */}

      <button
        onClick={toggleSidebar}
        className={c("sidebarButton iconButton", { active: isSidebarOpen })}
        aria-label="Toggle photo list"
        title="Toggle photo list"
      >
        <span className="icon">list</span>
      </button>

      <div style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '3px',
        fontSize: '12px',
        zIndex: 10000
      }}>
        Camera Z: {cameraCurrentZ.toFixed(2)}
      </div>
    </main>
  );
}
