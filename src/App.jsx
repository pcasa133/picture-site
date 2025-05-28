/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from "react";
import c from "clsx";
import PhotoViz from "./components/PhotoViz.jsx";
import useStore from "./store.js";
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";

import {
  setLayout,
  // sendQuery, // Removed
  // clearQuery, // Removed
  // setXRayMode, // Removed
  // toggleSidebar, // Moved to Header
} from "./actions.js";

export default function App() {
  const layout = useStore.use.layout();
  const images = useStore.use.images();
  const targetImage = useStore.use.targetImage();
  console.log("Current targetImage:", targetImage);
  
  const selectedImageDescription = targetImage && images
    ? images.find(img => img.id === targetImage)?.description
    : null;
  console.log("Current selectedImageDescription:", selectedImageDescription);

  // Layout buttons are removed from footer, but functionality could be added elsewhere if needed.
  // For now, direct calls to setLayout can be done programmatically or via other UI if desired.
  // Example: useEffect(() => setLayout('sphere'), []); to set initial layout.

  return (
    <>
      <Header />
      <main>
        <PhotoViz />
        <Sidebar />
        
        {selectedImageDescription && (
          <div className={c("description-panel", { visible: !!selectedImageDescription })}>
            <p>{selectedImageDescription}</p>
          </div>
        )}

        {/* Removed footer and all its contents (search bar, controls) */}
        {/* Sidebar button and zoom indicator moved to header */}
      </main>
    </>
  );
}
