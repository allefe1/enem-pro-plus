import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Questoes from './pages/Questoes';
import CorretorRedacao from './pages/CorretorRedacao';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/questoes" element={<Questoes />} />
            <Route path="/corretor" element={<CorretorRedacao />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

