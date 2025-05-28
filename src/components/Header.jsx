/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import c from "clsx";
import useStore from "../store.js";
import { toggleSidebar, setLayout, setNumber6Layout } from "../actions.js";
import logoPng from "../assets/logo.png";

const Header = () => {
  const isSidebarOpen = useStore.use.isSidebarOpen();
  const cameraCurrentZ = useStore.use.cameraCurrentZ();
  const isNumber6Mode = useStore.use.isNumber6Mode();
  const layout = useStore.use.layout();

  const handleLogoClick = () => {
    if (layout === 'number6') {
      // Se já estamos no modo número 6, volta para sphere
      setLayout('sphere');
      useStore.setState({ isNumber6Mode: false });
    } else {
      // Se não estamos no modo número 6, vai para number6
      setNumber6Layout();
      useStore.setState({ isNumber6Mode: true });
    }
  };

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
            src={logoPng} 
            alt="InfinitePay" 
            className={c("company-logo", { "number6-mode": isNumber6Mode })}
            onClick={handleLogoClick}
            style={{ cursor: 'pointer' }}
            title={isNumber6Mode ? "Clique para voltar ao layout normal" : "Clique para formar o número 6"}
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