# Thinking Space

## Description

Thinking Space is an interactive web application that allows users to explore a custom set of images through an immersive 3D visualization. Users can navigate through images presented in different layouts (sphere or grid) and view details of selected images.

This project is built using React, Three.js (via @react-three/fiber and @react-three/drei), and Zustand for state management.

## Running the Application

1.  **Prerequisites**:
    *   A modern web browser that supports WebGL.
    *   Ensure you have a local web server to serve the files if you encounter issues with directly opening `index.html` due to CORS or module loading policies (though for simple static sites, direct open might work). Many IDEs (like VS Code with Live Server extension) or simple command-line servers (e.g., `npx http-server`) can be used.

2.  **Setup**:
    *   Clone or download the project files.
    *   All dependencies are managed via ES modules and import maps in `index.html`, so no explicit `npm install` is required if you are running it directly from the provided source.

3.  **API Key (Note)**:
    *   The original version of this application may have included features utilizing the Google Gemini API, which would require an `API_KEY` to be set as an environment variable (`process.env.API_KEY`).
    *   However, with the current modifications (removal of the search bar and associated AI functionalities), the Gemini API is **not actively used**. Therefore, an API key is not required to run this version of the visualizer.

4.  **Launch**:
    *   Open the `index.html` file in your web browser. If using a local server, navigate to the appropriate URL (e.g., `http://localhost:8080`).

## Features

*   **3D Image Visualization**: Images are displayed as nodes in a 3D space.
*   **Interactive Navigation**: Use mouse controls (click, drag, scroll) to explore the 3D scene.
*   **Image Selection**: Click on an image node in the 3D view or in the sidebar list to select it.
*   **Description Display**: When an image is selected, its description is shown in a panel at the bottom of the screen.
*   **Sidebar List**: A collapsible sidebar lists all images with thumbnails and descriptions, allowing for easy browsing and selection.
*   **Dynamic Layouts**: Although the UI controls for switching layouts (sphere/grid) have been removed from the main interface to simplify, the underlying capability to switch layouts programmatically (`setLayout` action) still exists. The default layout is 'sphere'.

## File Structure

*   `index.html`: The main HTML file, includes import maps for dependencies.
*   `index.tsx`: The main entry point for the React application.
*   `index.css`: Global styles for the application.
*   `App.jsx`: The root React component, orchestrates the main UI and PhotoViz.
*   `PhotoViz.jsx`: Manages the 3D canvas and scene content (image nodes, camera controls).
*   `PhotoNode.jsx`: Renders individual image nodes in the 3D scene.
*   `Sidebar.jsx`: Renders the collapsible sidebar with the image list.
*   `store.js`: Zustand store for global state management.
*   `actions.js`: Functions to modify the global state.
*   `meta.json`: Contains metadata for the images (ID, description). This is fetched by the application.
*   `sphere.json`, `umap-grid.json`: Contain pre-calculated positional data for the image nodes in different layouts.
*   `llm.js`, `prompts.js`: These files were part of the original AI-powered search functionality. They have been emptied as this feature is currently removed.
*   `metadata.json` (root): Application metadata.
