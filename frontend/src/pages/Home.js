import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container">
      <div className="text-center mb-4">
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'white' }}>
          ENEM Pro+
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '3rem' }}>
          Sua plataforma completa de estudos para o ENEM
        </p>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2 className="text-primary mb-3">📚 Questões que Mais Caem</h2>
          <p className="text-secondary mb-3">
            Acesse milhares de questões organizadas por área de conhecimento, 
            com filtros por tema, ano, dificuldade e frequência no ENEM.
          </p>
          <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }}>
            <li>Matemática e suas Tecnologias</li>
            <li>Linguagens, Códigos e suas Tecnologias</li>
            <li>Ciências Humanas e suas Tecnologias</li>
            <li>Ciências da Natureza e suas Tecnologias</li>
          </ul>
          <Link to="/questoes" className="btn btn-primary">
            Começar a Estudar
          </Link>
        </div>

        <div className="card">
          <h2 className="text-primary mb-3">🤖 Corretor de Redação com IA</h2>
          <p className="text-secondary mb-3">
            Tenha sua redação corrigida instantaneamente por inteligência artificial, 
            com avaliação baseada nas 5 competências do ENEM.
          </p>
          <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }}>
            <li>Avaliação por competência (0-200 pontos)</li>
            <li>Feedback detalhado e personalizado</li>
            <li>Sugestões de melhoria específicas</li>
            <li>Correção instantânea e gratuita</li>
          </ul>
          <Link to="/corretor" className="btn btn-primary">
            Corrigir Redação
          </Link>
        </div>
      </div>

      <div className="card mt-4">
        <h2 className="text-center text-primary mb-3">Por que escolher o ENEM Pro+?</h2>
        <div className="grid grid-3">
          <div className="text-center">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
            <h3 className="mb-2">Rápido e Eficiente</h3>
            <p className="text-secondary">
              Acesso instantâneo a questões e correções sem necessidade de cadastro
            </p>
          </div>
          <div className="text-center">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
            <h3 className="mb-2">Foco no ENEM</h3>
            <p className="text-secondary">
              Conteúdo específico e direcionado para o Exame Nacional do Ensino Médio
            </p>
          </div>
          <div className="text-center">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🆓</div>
            <h3 className="mb-2">Totalmente Gratuito</h3>
            <p className="text-secondary">
              Todas as funcionalidades disponíveis sem custo algum
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

