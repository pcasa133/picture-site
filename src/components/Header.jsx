/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import c from "clsx";
import useStore from "../store.js";
import { toggleSidebar } from "../actions.js";
import logoSvg from "../assets/logo.svg";

const Header = () => {
  const isSidebarOpen = useStore.use.isSidebarOpen();
  const cameraCurrentZ = useStore.use.cameraCurrentZ();

  return (
    <header className="header">
      <div className="header-container">
        {/* Marcação de zoom à esquerda */}
        <div className="header-left">
          <div className="zoom-indicator">
            Camera Z: {cameraCurrentZ.toFixed(2)}
          </div>
        </div>

        {/* Logo centralizado */}
        <div className="logo-placeholder">
          <img 
            src={logoSvg} 
            alt="InfinitePay" 
            className="company-logo"
          />
        </div>

        {/* Botão de lista à direita - ESCONDIDO */}
        <div className="header-right">
          {/* <button
            onClick={toggleSidebar}
            className={c("header-list-button", { active: isSidebarOpen })}
            aria-label="Toggle photo list"
            title="Toggle photo list"
          >
            <span className="icon">list</span>
          </button> */}
        </div>
      </div>
    </header>
  );
};

export default Header; 