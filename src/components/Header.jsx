/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import c from "clsx";
import useStore from "../store.js";
import { toggleSidebar, cycleModes } from "../actions.js";
import logoPng from "../assets/logo.png";

const Header = () => {
  const isSidebarOpen = useStore.use.isSidebarOpen();
  const cameraCurrentZ = useStore.use.cameraCurrentZ();
  const currentMode = useStore.use.currentMode();
  const layout = useStore.use.layout();

  const handleLogoClick = () => {
    cycleModes();
  };

  // Determina a classe CSS baseada no modo atual
  const getLogoClass = () => {
    switch (currentMode) {
      case 1:
        return "mode1";
      case 2:
        return "mode2";
      case 3:
        return "mode3";
      case 4:
        return "mode4";
      case 5:
        return "mode5";
      case 6:
        return "number6-mode";
      default:
        return "";
    }
  };

  // Gera o título baseado no modo atual
  const getTitle = () => {
    switch (currentMode) {
      case 0:
        return "Clique para ativar Modo 1 - Espiral Dupla";
      case 1:
        return "Modo 1 - Espiral Dupla | Clique para Modo 2";
      case 2:
        return "Modo 2 - Ondas Concêntricas | Clique para Modo 3";
      case 3:
        return "Modo 3 - Mandala | Clique para Modo 4";
      case 4:
        return "Modo 4 - Diamante Fractal | Clique para Modo 5";
      case 5:
        return "Modo 5 - Galáxia Espiral | Clique para o Número 6";
      case 6:
        return "Modo 6 - Número 6 Original | Clique para voltar ao normal";
      default:
        return "Clique para ativar layouts especiais";
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
            className={c("company-logo", getLogoClass())}
            onClick={handleLogoClick}
            style={{ cursor: 'pointer' }}
            title={getTitle()}
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