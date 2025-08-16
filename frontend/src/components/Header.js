import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          ENEM Pro+
        </div>
        <nav className="nav">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Início
          </Link>
          <Link 
            to="/questoes" 
            className={`nav-link ${location.pathname === '/questoes' ? 'active' : ''}`}
          >
            Questões
          </Link>
          <Link 
            to="/corretor" 
            className={`nav-link ${location.pathname === '/corretor' ? 'active' : ''}`}
          >
            Corretor de Redação
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;

